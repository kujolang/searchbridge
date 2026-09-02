use searchbridge::{validate_result, SearchBridgeClient};
fn main() -> Result<(), Box<dyn std::error::Error>> {
    let executable = std::env::current_dir()?
        .join("../../searchbridge")
        .canonicalize()?;
    let client = SearchBridgeClient::new(executable).current_dir("../..");
    let value = client.run(&[
        "fetch",
        "--capability",
        "analytics",
        "--provider",
        "google-analytics-4",
        "--fixture",
        "--offline",
        "--deterministic",
    ])?;
    validate_result(&value)?;
    println!("{} rows", value["rows"].as_array().map_or(0, Vec::len));
    Ok(())
}
