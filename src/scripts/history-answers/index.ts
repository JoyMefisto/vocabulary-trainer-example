import { EARLY_STOP, EventBus } from "../event-bus";

interface IWord {
  word: string;
  countErrors: number;
  isError?: boolean;
}

interface IStatistic {
  countWordsWithoutMistakes: number;
  countOfAllMistakes: number;
  badWord: IWord | undefined;
}

/**
 * Класс хранит статистику ответов
 */
export class HistoryAnswers {
  private words: IWord[] = [];

  constructor(private maxCountErrors: number = 3) {}

  /**
   * Завести новое слово в словарь
   * @param word
   */
  createWord(word: string): void {
    if (!this.words[word]) {
      this.words[word] = {
        word,
        countErrors: 0,
        isError: false,
      };
    }
  }

  /**
   * Сохранить ошибку для текущего слова
   * @param word
   */
  saveError(word: string): void {
    if (!this.words[word]) {
      this.createWord(word);
    }

    this.words[word].isError = true;
    this.words[word].countErrors++;

    if (this.words[word].countErrors === this.maxCountErrors) {
      EventBus.publish(EARLY_STOP, {
        message: "Превышен лимит не правильных ответов",
      });
    }
  }

  /**
   * Собираем статистику по ответам в необходимом формате
   */
  getStatistic(): IStatistic {
    let countWordsWithoutMistakes: number = 0;
    let countOfAllMistakes: number = 0;
    let badWord: IWord | undefined = undefined;

    Object.keys(this.words).forEach((key) => {
      const word = this.words[key];

      if (word.isError) {
        if (!badWord || badWord.countErrors < word.countErrors) {
          badWord = word;
        }

        countOfAllMistakes += word.countErrors;
      } else {
        countWordsWithoutMistakes++;
      }
    });

    return {
      countWordsWithoutMistakes,
      countOfAllMistakes,
      badWord,
    };
  }
}
