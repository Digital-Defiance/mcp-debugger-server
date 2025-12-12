# MCP ACS Debugger Server - Images & Screenshots

This directory contains images, screenshots, and animated GIFs for the MCP ACS Debugger Server documentation.

## Required Images

To complete the documentation, please add the following images:

### 1. Debugging Session Demo

**Filename**: `debugging-session.gif` or `debugging-session.png`
**Description**: Shows a complete debugging session including:

- Starting a debug session
- Setting a breakpoint
- Pausing at the breakpoint
- Inspecting variables
- Stepping through code

**Recommended Size**: 800x400px or larger
**Format**: Animated GIF (preferred) or PNG

### 2. Hang Detection Demo

**Filename**: `hang-detection.gif` or `hang-detection.png`
**Description**: Demonstrates hang detection in action:

- Running a script with an infinite loop
- Hang detection triggering
- Displaying the hang location and stack trace

**Recommended Size**: 800x400px or larger
**Format**: Animated GIF (preferred) or PNG

### 3. TypeScript Debugging Demo

**Filename**: `typescript-debugging.gif` or `typescript-debugging.png`
**Description**: Shows TypeScript debugging with source maps:

- Setting breakpoints in .ts files
- Inspecting variables with TypeScript names
- Source map location mapping

**Recommended Size**: 800x400px or larger
**Format**: Animated GIF (preferred) or PNG

### 4. AI Agent Integration

**Filename**: `ai-agent-integration.gif` or `ai-agent-integration.png`
**Description**: Shows an AI agent using the debugger:

- AI agent receiving debugging request
- Agent using MCP tools
- Debugging results displayed to user

**Recommended Size**: 800x400px or larger
**Format**: Animated GIF (preferred) or PNG

### 5. Performance Profiling

**Filename**: `performance-profiling.gif` or `performance-profiling.png`
**Description**: Demonstrates performance profiling:

- Starting CPU profiling
- Running code
- Viewing profiling results
- Identifying bottlenecks

**Recommended Size**: 800x400px or larger
**Format**: Animated GIF (preferred) or PNG

## Creating Screenshots

### Tools for Creating Animated GIFs

1. **macOS**:
   - [Kap](https://getkap.co/) - Free, open-source screen recorder
   - [LICEcap](https://www.cockos.com/licecap/) - Simple GIF recorder
   - [Gifox](https://gifox.io/) - Professional GIF recorder

2. **Windows**:
   - [ScreenToGif](https://www.screentogif.com/) - Free, feature-rich
   - [LICEcap](https://www.cockos.com/licecap/) - Simple GIF recorder
   - [ShareX](https://getsharex.com/) - Free, open-source

3. **Linux**:
   - [Peek](https://github.com/phw/peek) - Simple GIF recorder
   - [Gifine](https://github.com/leafo/gifine) - Lightweight recorder
   - [SimpleScreenRecorder](https://www.maartenbaert.be/simplescreenrecorder/) + [FFmpeg](https://ffmpeg.org/)

### Best Practices

1. **Resolution**: Use at least 800x400px, preferably 1200x600px
2. **Frame Rate**: 10-15 FPS for GIFs (keeps file size reasonable)
3. **Duration**: Keep GIFs under 30 seconds
4. **File Size**: Optimize GIFs to be under 5MB
5. **Quality**: Use high contrast and readable text
6. **Annotations**: Add arrows or highlights to draw attention to key features

### Recording Tips

1. **Clean Environment**: Use a clean terminal/editor with minimal distractions
2. **Readable Text**: Use a large font size (14-16pt minimum)
3. **Smooth Actions**: Move slowly and deliberately
4. **Pause Between Actions**: Give viewers time to see what's happening
5. **Show Results**: Always show the outcome of actions

### Optimization

After creating GIFs, optimize them:

```bash
# Using gifsicle (install via brew/apt/choco)
gifsicle -O3 --colors 256 input.gif -o output.gif

# Using ImageMagick
convert input.gif -fuzz 10% -layers Optimize output.gif
```

## Updating the README

Once you've added images, update the main README.md:

1. Replace placeholder image URLs with actual image paths:

   ```markdown
   ![Debugging Session](./images/debugging-session.gif)
   ```

2. Add alt text for accessibility:

   ```markdown
   ![Debugging Session - Setting breakpoints and inspecting variables](./images/debugging-session.gif)
   ```

3. Consider adding captions:

   ```markdown
   ![Debugging Session](./images/debugging-session.gif)
   *Setting breakpoints and inspecting variables in a Node.js application*
   ```

## Image Checklist

- [ ] Debugging session demo (GIF or PNG)
- [ ] Hang detection demo (GIF or PNG)
- [ ] TypeScript debugging demo (GIF or PNG)
- [ ] AI agent integration demo (GIF or PNG)
- [ ] Performance profiling demo (GIF or PNG)
- [ ] All images optimized for web
- [ ] All images have descriptive filenames
- [ ] README.md updated with actual image paths
- [ ] Alt text added for accessibility

## Questions?

If you need help creating or optimizing images, please:

- Open an issue on GitHub
- Email <info@digitaldefiance.org>
- Check the [CONTRIBUTING.md](../../CONTRIBUTING.md) guide
