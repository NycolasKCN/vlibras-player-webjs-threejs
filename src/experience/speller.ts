import { GlossAnimationClip } from "./types";

export interface SpellerStrategy {
  spell(
    word: string,
    alphabetMap: Map<string, GlossAnimationClip>,
  ): GlossAnimationClip[];
}

export class AlphabetSpeller implements SpellerStrategy {
  // FIXME: Verificar situação com letras acentuadas
  spell(
    word: string,
    alphabetMap: Map<string, GlossAnimationClip>,
  ): GlossAnimationClip[] {
    const chars = word.split("&")[0].split("");

    return chars
      .map((char, currentIndex) => {
        const letterClip = alphabetMap.get(char);

        if (letterClip && letterClip.clip) {
          const formattedSubtitle = chars
            .map((c, i) => (i === currentIndex ? `<span style="font-weight: bold; display: inline;">${c}</span>` : c))
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
}
