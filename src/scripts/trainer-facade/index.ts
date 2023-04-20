/*
 * Паттерн фасад - поддерживает сложную логику за простым API
 */

import { HTMLProcessBridge, DOMProvider } from "../html-process-bridge";
import { randomElementList } from "../../utils/random-element-list";
import { NextStep } from "../next-step";
import { HistoryAnswers } from "../history-answers";
import { EventBus, WRONG_ANSWER, NEXT_ANSWERS, EARLY_STOP } from "../event-bus";

/**
 * Фасад для запуска работы классов: пагинация, DOM, история ответов
 */
export class TrainerFacade {
  private htmlProcessBridge: HTMLProcessBridge;
  private nextStep: NextStep;
  private historyAnswers: HistoryAnswers;

  constructor(
    public collectionWords: string[],
    public wholeContainer: HTMLElement, // Контейнер для правильного слова
    public splitContainer: HTMLElement, // Контейнер для разбросанных букв
    public containerPagination: HTMLElement, // Контейнер для пагинации
    public currentQuestion: HTMLElement, // Контейнер для номера текушего вопроса
    public totalQuestions: HTMLElement, // Контейнер для номера последнего вопроса
    public containerNotifyResult: HTMLElement, // Контейнер для вывода результата
    public currentNumberQuestion: number = 0,
    public totalNumberQuestion: number = collectionWords.length - 1
  ) {
    this.htmlProcessBridge = new HTMLProcessBridge(
      new DOMProvider(this.wholeContainer, this.splitContainer)
    );

    this.nextStep = new NextStep(
      this.currentQuestion,
      this.totalQuestions,
      containerPagination,
      this.currentNumberQuestion + 1, // min 1
      this.totalNumberQuestion + 1 // max 6
    );

    this.historyAnswers = new HistoryAnswers();
  }

  init() {
    this.subscribeEvents();
    this.runAnswer();
    this.nextStep.showPagination();
  }

  /**
   * Сохраняем слово в логгере и запускаем интерактив для выбора букв
   */
  runAnswer(): void {
    const word = this.collectionWords[this.currentNumberQuestion];

    this.historyAnswers.createWord(word);
    this.htmlProcessBridge.init(word, this.createSplitWord(word));
  }

  /**
   * Подписываемся на события для дальнейшего взаимодействия с классами
   */
  subscribeEvents(): void {
    EventBus.subscribe(WRONG_ANSWER, (e) => {
      this.historyAnswers.saveError(e);
    });
    EventBus.subscribe(NEXT_ANSWERS, () => {
      this.nextQuestion();
    });
    EventBus.subscribe(EARLY_STOP, ({ message }) => {
      console.warn("message:", message);
      this.htmlProcessBridge.answered();
    });
  }

  /**
   * Переключить на следующий вопрос или показать результат
   */
  nextQuestion(): void {
    if (this.currentNumberQuestion === this.totalNumberQuestion) {
      this.nextStep.hidePagination();
      this.showResult();
    } else {
      this.currentNumberQuestion++;
      this.runAnswer();
      this.nextStep.next();
    }
  }

  /**
   * Вывести результат
   */
  showResult(): void {
    const { countWordsWithoutMistakes, countOfAllMistakes, badWord } =
      this.historyAnswers.getStatistic();

    this.containerNotifyResult.innerHTML = `
        <p>Число собранных слов без ошибок: ${countWordsWithoutMistakes}</p>
        <p>Общее число ошибок: ${countOfAllMistakes}</p>
		`;
    if (badWord !== undefined) {
      const { word, countErrors } = badWord;
      this.containerNotifyResult.innerHTML += `<p>Слово, с самым большим числом ошибок: ${word} - ${countErrors}</p>`;
    }
  }
  /**
   * Перетасовать буквы слова
   * @param word
   */
  createSplitWord(word: string): string {
    const tempWord = word.split("");
    const lengthWord = tempWord.length;

    return randomElementList(tempWord, lengthWord).join("");
  }
}
