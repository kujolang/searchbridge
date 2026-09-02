use serde_json::Value;
use std::fmt;
use std::io::{self, BufRead};
use std::path::PathBuf;
use std::process::Command;

#[derive(Debug)]
pub enum SearchBridgeError {
    Io(io::Error),
    Exit { code: Option<i32>, stderr: String },
    Json(serde_json::Error),
    InvalidResult(&'static str),
}
impl fmt::Display for SearchBridgeError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Self::Io(e) => write!(f, "{e}"),
            Self::Exit { code, stderr } => write!(f, "SearchBridge exited {code:?}: {stderr}"),
            Self::Json(e) => write!(f, "invalid SearchBridge JSON: {e}"),
            Self::InvalidResult(e) => write!(f, "invalid SearchBridge result: {e}"),
        }
    }
}
impl std::error::Error for SearchBridgeError {}
impl From<io::Error> for SearchBridgeError {
    fn from(value: io::Error) -> Self {
        Self::Io(value)
    }
}
impl From<serde_json::Error> for SearchBridgeError {
    fn from(value: serde_json::Error) -> Self {
        Self::Json(value)
    }
}
#[derive(Debug, Clone)]
pub struct SearchBridgeClient {
    executable: PathBuf,
    cwd: Option<PathBuf>,
}
impl Default for SearchBridgeClient {
    fn default() -> Self {
        Self::new(std::env::var_os("SEARCHBRIDGE_BIN").unwrap_or_else(|| "searchbridge".into()))
    }
}
impl SearchBridgeClient {
    pub fn new(executable: impl Into<PathBuf>) -> Self {
        Self {
            executable: executable.into(),
            cwd: None,
        }
    }
    pub fn current_dir(mut self, cwd: impl Into<PathBuf>) -> Self {
        self.cwd = Some(cwd.into());
        self
    }
    pub fn run(&self, args: &[&str]) -> Result<Value, SearchBridgeError> {
        let mut command = Command::new(&self.executable);
        command.args(args);
        if let Some(cwd) = &self.cwd {
            command.current_dir(cwd);
        }
        let output = command.output()?;
        if !output.status.success() {
            return Err(SearchBridgeError::Exit {
                code: output.status.code(),
                stderr: String::from_utf8_lossy(&output.stderr)
                    .chars()
                    .take(65_536)
                    .collect(),
            });
        }
        Ok(serde_json::from_slice(&output.stdout)?)
    }
}
pub fn validate_result(value: &Value) -> Result<(), SearchBridgeError> {
    if value.get("schema").and_then(Value::as_str) != Some("searchbridge.result/v1") {
        return Err(SearchBridgeError::InvalidResult("schema"));
    }
    if !value.get("rows").is_some_and(Value::is_array) {
        return Err(SearchBridgeError::InvalidResult("rows"));
    }
    Ok(())
}
pub fn read_json_lines<R: BufRead>(
    reader: R,
) -> impl Iterator<Item = Result<Value, SearchBridgeError>> {
    reader
        .lines()
        .filter(|line| line.as_ref().map_or(true, |text| !text.trim().is_empty()))
        .map(|line| Ok(serde_json::from_str(&line?)?))
}
