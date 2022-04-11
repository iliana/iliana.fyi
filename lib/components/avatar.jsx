/* eslint-disable import/no-unresolved */

import c from "classnames/dedupe";
import React from "react";
import png from "../iliana.png?size=96";
import avif from "../iliana.png?size=96&format=avif";
import webp from "../iliana.png?size=96&format=webp";

export default function Avatar({ index, page }) {
  return (
    <picture>
      <source srcSet={avif.src} type="image/avif" />
      <source srcSet={webp.src} type="image/webp" />
      <img
        src={png.src}
        className={c(
          "rounded-full inline align-top",
          { "h-8 lg:h-9 xl:h-10 2xl:h-12": index },
          { "w-8 lg:w-9 xl:w-10 2xl:w-12": index },
          { "mr-2.5 lg:mr-3 xl:mr-3.5 2xl:mr-4": index },
          { "h-7 xl:h-8 2xl:h-9": page },
          { "w-7 xl:w-8 2xl:w-9": page },
          { "mr-2.5 mr-2 xl:mr-2.5 2xl:mr-3": page }
        )}
        alt=""
      />
    </picture>
  );
}
