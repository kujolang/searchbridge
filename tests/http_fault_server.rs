use std::env;
use std::fs;
use std::io::{Read, Write};
use std::net::{TcpListener, TcpStream};
use std::sync::atomic::{AtomicUsize, Ordering};
use std::thread;
use std::time::Duration;

static THROTTLE_COUNT: AtomicUsize = AtomicUsize::new(0);

fn respond(mut stream: TcpStream) {
    let mut request = [0_u8; 4096];
    let size = stream.read(&mut request).unwrap_or(0);
    let first = String::from_utf8_lossy(&request[..size]);
    let path = first.split_whitespace().nth(1).unwrap_or("/");
    if path == "/drop" { return; }
    if path == "/slow" { thread::sleep(Duration::from_secs(1)); }
    let (status, headers, body) = if path == "/redirect" {
        ("302 Found", "Location: /ok\r\n", "")
    } else if path == "/malformed" {
        ("200 OK", "Content-Type: application/json\r\n", "{not-json")
    } else if path == "/throttle" && THROTTLE_COUNT.fetch_add(1, Ordering::SeqCst) == 0 {
        ("429 Too Many Requests", "Retry-After: 0\r\n", "{}")
    } else {
        ("200 OK", "Content-Type: application/json\r\n", "{\"ok\":true}")
    };
    let response = format!("HTTP/1.1 {status}\r\n{headers}Content-Length: {}\r\nConnection: close\r\n\r\n{body}", body.len());
    let _ = stream.write_all(response.as_bytes());
}

fn main() {
    let args: Vec<String> = env::args().collect();
    if args.get(1).map(String::as_str) == Some("--free-port") {
        let listener = TcpListener::bind("127.0.0.1:0").unwrap();
        println!("{}", listener.local_addr().unwrap().port());
        return;
    }
    let port_file = args.get(1).expect("port file");
    let listener = TcpListener::bind("127.0.0.1:0").unwrap();
    fs::write(port_file, listener.local_addr().unwrap().port().to_string()).unwrap();
    for stream in listener.incoming().flatten() { thread::spawn(|| respond(stream)); }
}
