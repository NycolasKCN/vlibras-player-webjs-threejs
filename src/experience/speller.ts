import { GlossAnimationClip } from "./types";

export interface SpellerStrategy {
  spell(
    word: string,
    alphabetMap: Map<string, GlossAnimationClip>,
  ): GlossAnimationClip[];
}

export class AlphabetSpeller implements SpellerStrategy {
  spell(
    word: string,
    alphabetMap: Map<string, GlossAnimationClip>,
  ): GlossAnimationClip[] {
    const chars = word.split("&")[0].split("");

    return chars
      .map((char, currentIndex) => {
        const letterClip = alphabetMap.get(this.normalizeChar(char));

        if (letterClip && letterClip.clip) {
          const formattedSubtitle = chars
            .map((c, i) =>
              i === currentIndex
                ? `<span style="font-weight: bold; display: inline;">${c}</span>`
                : c,
            )
            .join("-");

          return {
            ...letterClip,
            word: formattedSubtitle,
          };
        }

        return undefined;
      })
      .filter((clip): clip is GlossAnimationClip => clip !== undefined);
  }

  private normalizeChar(char: string): string {
    return char.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  }
}
