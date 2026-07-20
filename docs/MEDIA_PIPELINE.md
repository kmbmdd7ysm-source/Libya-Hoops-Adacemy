# Media asset pipeline

Hero video paths remain unchanged and no final video is included:

- `/media/hero/lha-hero-desktop.mp4`
- `/media/hero/lha-hero-mobile.mp4`

Product media records should use `{id,type,src,mobileSrc,desktopSrc,poster,thumbnail,alt,caption,width,height,aspectRatio,variant,color,sortOrder}`. Supported types: image, video, sequence360, detail, lifestyle, fit, size-reference, material, front, back, side. Show 360 controls only when every declared frame exists. Export AVIF/WebP plus JPEG/PNG fallback with intrinsic dimensions.
