import { useState } from "react";
import { isValidUrl } from "../utils/format";

type PosterProps = {
  url: string | null;
  title: string;
  className?: string;
};

// Gera um tom de cor estável a partir do título (mesmo filme = mesma cor)
function hueFromTitle(title: string) {
  let hash = 0;
  for (let i = 0; i < title.length; i++) {
    hash = (hash * 31 + title.charCodeAt(i)) % 360;
  }
  return hash;
}

export function Poster({ url, title, className = "" }: PosterProps) {
  // Se a imagem der erro (link quebrado), cai no placeholder
  const [failed, setFailed] = useState(false);
  const showImage = url && isValidUrl(url) && !failed;

  if (showImage) {
    return (
      <div className={`poster ${className}`}>
        <img
          src={url}
          alt={`Pôster de ${title}`}
          loading="lazy"
          onError={() => setFailed(true)}
        />
      </div>
    );
  }

  const hue = hueFromTitle(title);

  return (
    <div
      className={`poster poster-fallback ${className}`}
      style={{ "--hue": hue } as React.CSSProperties}
      aria-label={`${title} (sem pôster)`}
      role="img"
    >
      <span>{title}</span>
    </div>
  );
}
