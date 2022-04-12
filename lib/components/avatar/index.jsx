import c from "classnames/dedupe";
import React from "react";
import resolveConfig from "tailwindcss/resolveConfig";
import tailwindConfig from "../../../tailwind.config";
import png48 from "./iliana@48w.png";
import webp48 from "./iliana@48w.webp";
import png64 from "./iliana@64w.png";
import webp64 from "./iliana@64w.webp";
import png96 from "./iliana@96w.png";
import webp96 from "./iliana@96w.webp";

const images = {
  webp: { 48: webp48, 64: webp64, 96: webp96 },
  png: { 48: png48, 64: png64, 96: png96 },
};

Object.keys(images).forEach((type) => {
  images[type].srcSet = Object.entries(images[type])
    .map(([size, path]) => `${path} ${size}w`)
    .join(", ");
});

export default function Avatar({ size }) {
  const { screens } = resolveConfig(tailwindConfig).theme;

  const sizeClasses = {
    index: "h-8 lg:h-9 xl:h-10 2xl:h-12 w-8 lg:w-9 xl:w-10 2xl:w-12 mr-2.5 lg:mr-3 xl:mr-3.5 2xl:mr-4",
    page: "h-7 xl:h-8 2xl:h-9 w-7 xl:w-8 2xl:w-9 mr-2.5 mr-2 xl:mr-2.5 2xl:mr-3",
  }[size];

  const sizes = sizeClasses
    .split(" ")
    .filter((cl) => cl.match(/h-/))
    .map((cl) => {
      const [a, b] = cl.split(":");
      const px = `${parseInt((b ?? a).split("-")[1], 10) * 4}px`;
      return b === undefined ? px : `(min-width: ${screens[a]}) ${px}`;
    });
  sizes.reverse();

  return (
    <picture>
      <source srcSet={images.webp.srcSet} sizes={sizes.join(", ")} type="image/webp" />
      <img
        srcSet={images.png.srcSet}
        sizes={sizes.join(", ")}
        src={images.png[96]}
        className={c("rounded-full inline align-top", sizeClasses)}
        alt=""
      />
    </picture>
  );
}
