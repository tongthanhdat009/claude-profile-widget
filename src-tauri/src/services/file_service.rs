use anyhow::{Context, Result};
use std::fs;
use std::path::{Path, PathBuf};

/// Checks whether a file exists at the given path.
pub fn file_exists(path: &Path) -> bool {
    path.exists()
}

/// Reads UTF-8 content from a file.
pub fn read_file(path: &Path) -> Result<String> {
    fs::read_to_string(path)
        .with_context(|| format!("Failed to read file: {}", path.display()))
}

/// Writes UTF-8 content to a file, creating parent directories as needed.
pub fn write_file(path: &Path, content: &str) -> Result<()> {
    if let Some(parent) = path.parent() {
        fs::create_dir_all(parent)
            .with_context(|| format!("Failed to create directory: {}", parent.display()))?;
    }
    fs::write(path, content)
        .with_context(|| format!("Failed to write file: {}", path.display()))
}

/// Copies a file from `src` to `dst`, creating parent directories as needed.
pub fn copy_file(src: &Path, dst: &Path) -> Result<u64> {
    if let Some(parent) = dst.parent() {
        fs::create_dir_all(parent)
            .with_context(|| format!("Failed to create directory: {}", parent.display()))?;
    }
    fs::copy(src, dst)
        .with_context(|| format!("Failed to copy {} → {}", src.display(), dst.display()))
}

/// Deletes a file.
pub fn delete_file(path: &Path) -> Result<()> {
    fs::remove_file(path)
        .with_context(|| format!("Failed to delete file: {}", path.display()))
}

/// Lists all file paths in a directory with a given extension filter.
pub fn list_files_with_ext(dir: &Path, ext: &str) -> Result<Vec<PathBuf>> {
    if !dir.exists() {
        return Ok(vec![]);
    }
    let mut files = Vec::new();
    for entry in fs::read_dir(dir)
        .with_context(|| format!("Failed to read directory: {}", dir.display()))?
    {
        let entry = entry?;
        let path = entry.path();
        if path.is_file() {
            if let Some(e) = path.extension() {
                if e == ext {
                    files.push(path);
                }
            }
        }
    }
    files.sort();
    Ok(files)
}

/// Lists all files in a directory.
pub fn list_files(dir: &Path) -> Result<Vec<PathBuf>> {
    if !dir.exists() {
        return Ok(vec![]);
    }
    let mut files = Vec::new();
    for entry in fs::read_dir(dir)
        .with_context(|| format!("Failed to read directory: {}", dir.display()))?
    {
        let entry = entry?;
        let path = entry.path();
        if path.is_file() {
            files.push(path);
        }
    }
    files.sort();
    Ok(files)
}
