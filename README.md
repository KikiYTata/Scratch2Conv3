# Scratch2Conv3
Convert sb2 to sb3

# SB2 to SB3 Converter

A small JavaScript converter for Scratch SB2 project files (`.sb2`) to Scratch SB3 files (`.sb3`).

## Requirements

- Node.js
- npm

## Setup

```bash
cd ~/sb2-to-sb3
npm install
```

## Usage

```bash
node index.js input.sb2 output.sb3
```

If `output.sb3` is omitted, the converter will write `input.sb3` next to the source file.

## Notes

- This converter performs a best-effort translation of most common Scratch 2 blocks into Scratch 3 block opcodes.
- Some SB2 blocks or advanced custom blocks may not convert perfectly.
- The script preserves costumes and sound assets from the original `.sb2` file.
- Download it az .zip
