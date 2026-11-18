import emptyUrl from '../../../assets/heart-empty.svg';
import fullUrl from '../../../assets/heart.svg';

interface HeartProps {
  /** False shows a lost life. */
  full: boolean;
  /** Size of one sprite pixel in CSS pixels; the heart is 9x8. */
  pixelSize?: number;
}

/** One life. Decorative: the parent gives the lives count a label. */
export function Heart({ full, pixelSize = 3 }: HeartProps) {
  return (
    <img
      src={full ? fullUrl : emptyUrl}
      width={9 * pixelSize}
      height={8 * pixelSize}
      alt=""
      draggable={false}
    />
  );
}
