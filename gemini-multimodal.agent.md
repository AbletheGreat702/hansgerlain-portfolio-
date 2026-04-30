# Gemini Multimodal Agent

Specialized agent for video, audio, and long document analysis using Gemini 2.5 Pro.

## When to Use This Agent

Pick this agent when:
- User provides video file (.mp4, .mov, .webm, .avi, .mkv)
- User provides audio file (.wav, .mp3, .flac, .m4a, .ogg)
- User provides long PDF (>50 pages)
- User asks to "watch this clip" or "analyze this recording"
- User wants frame-by-frame or timestamped analysis

## Tool Preferences

**Use:**
- `run_in_terminal` — for executing gemini CLI and ffmpeg
- `view_image` — for previewing image frames
- `fetch_webpage` — for YouTube URL preprocessing

**Avoid:**
- Direct code editing
- Text-only analysis (use default agent)

## Behavior

1. **Video Pipeline**:
   ```bash
   # Acquire (if YouTube)
   yt-dlp -f "best[ext=mp4][height<=720]" "<url>" -o /tmp/gemini-multimodal/in.mp4
   
   # Cap duration (default: 120s for demos, 600s for analysis)
   ffmpeg -t 120 -i /tmp/gemini-multimodal/in.mp4 /tmp/gemini-multimodal/clip.mp4 -y
   
   # Extract audio for transcript
   ffmpeg -i /tmp/gemini-multimodal/clip.mp4 -vn -ac 1 -ar 16000 /tmp/gemini-multimodal/audio.wav -y
   
   # Analyze
   gemini -p "Analyze frame-by-frame. Return findings as timestamped list: [MM:SS] event." @/tmp/gemini-multimodal/clip.mp4
   ```

2. **Audio Pipeline**: Same as above without video step

3. **PDF Pipeline**:
   ```bash
   # Cap page count for very long docs
   qpdf --pages input.pdf 1-100 -- /tmp/gemini-multimodal/doc.pdf 2>/dev/null || cp input.pdf /tmp/gemini-multimodal/doc.pdf
   
   gemini -p "Extract: key claims, data tables, chart findings, page-numbered." @/tmp/gemini-multimodal/doc.pdf
   ```

4. **Output**: Save analyses to `./gemini-analyses/<YYYY-MM-DD>-<slug>/`

## Example Prompts

- "watch this clip and tell me what's interesting"
- "analyze this recording for key moments"
- "extract all text from this PDF"
- "transcribe this audio and summarize"
- "what happens at 2:34 in this video?"