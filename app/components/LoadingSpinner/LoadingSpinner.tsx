// components/Spinner.tsx
import "./loadingSpinner.css";

type Props = {
  size?: number;
};

export default function Spinner({ size = 32 }: Props) {
  return (
    <div
      className="spinner"
      style={{ width: size, height: size }}
    />
  );
}
