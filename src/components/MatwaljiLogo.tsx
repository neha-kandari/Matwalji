import image_matwalji_removebg_preview_2 from '@/imports/matwalji-removebg-preview-2.png'
interface Props {
  size?: "sm" | "md" | "lg";
  src?: string;
  height?: number;
}

// This mark is exported with a transparent background (gold artwork only),
// so it reads correctly against every dark surface on the site — no need to
// swap files per background, unlike the old baked-in-maroon .jpeg export.
export default function MatwaljiLogo({ size = "md", src = image_matwalji_removebg_preview_2, height }: Props) {
  const heights = { sm: 52, md: 80, lg: 104 };
  const h = height ?? heights[size];

  return (
    <img
      src={src}
      alt="MATWALJI Sarees"
      style={{ height: h, width: "auto", objectFit: "contain", display: "block" }}
    />
  );
}
