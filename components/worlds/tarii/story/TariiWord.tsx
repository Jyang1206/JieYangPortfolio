/* eslint-disable @next/next/no-img-element -- an inline wordmark sized in em, set by the story's CSS. */
import { Fragment, type ReactNode } from "react";

/**
 * The Tarii wordmark as running text. The image is 356 by 181 px with an
 * x-height of 109 px, so at 0.857em (`.tsy .tarii-word`) its x-height lands on
 * the text x-height and its bottom sits on the baseline. The alt text keeps
 * screen readers reading "Tarii".
 */
export function TariiWord() {
  return (
    <img
      src="/tarii-story/tarii-wordmark.png"
      alt="Tarii"
      width={356}
      height={181}
      className="tarii-word"
      draggable={false}
    />
  );
}

/** Splits a plain string and swaps each "Tarii" for the wordmark. */
export function withTariiWord(text: string): ReactNode {
  return text.split("Tarii").map((part, i) => (
    <Fragment key={i}>
      {i > 0 ? <TariiWord /> : null}
      {part}
    </Fragment>
  ));
}
