import { useEffect, useRef } from 'react';

interface Props {
  videoId: string;
  start?: number;
  autoplay?: boolean;
  className?: string;
}

// YouTube埋め込み。start が変わると再読み込みしてその位置から再生する
export default function YouTube({ videoId, start = 0, autoplay = false, className }: Props) {
  const ref = useRef<HTMLIFrameElement>(null);
  const params = new URLSearchParams({
    start: String(Math.floor(start)),
    autoplay: autoplay ? '1' : '0',
    playsinline: '1',
    rel: '0',
    modestbranding: '1',
    controls: '1',
    fs: '0',
  });
  const src = `https://www.youtube-nocookie.com/embed/${videoId}?${params.toString()}`;

  useEffect(() => {
    if (ref.current && ref.current.src !== src) ref.current.src = src;
  }, [src]);

  return (
    <div className={`yt ${className ?? ''}`}>
      <iframe
        ref={ref}
        src={src}
        title="training video"
        allow="autoplay; encrypted-media; picture-in-picture"
        allowFullScreen={false}
      />
    </div>
  );
}
