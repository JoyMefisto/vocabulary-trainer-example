import {
  EventBus,
  WRONG_ANSWER,
  CORRECT_ANSWER,
  NEXT_ANSWERS,
} from "../event-bus";
import { isAlphabetEN } from "../../utils/keypress";

class Template {
  private templates = [
    {
      type: "button",
      template(char: string): HTMLElement {
        const button = document.createElement("button");

        button.type = "button";
        button.className = "btn btn-primary m-1";
        button.dataset.char = char;
        button.style.width = "40px";
        button.style.height = "40px";
        button.innerText = char;

        return button;
      },
    },
  ];

  public getTemplateByName(name: string) {
    return this.templates.find((t) => t.type === name);
  }
}

interface IProvider {
  template: Template;
  word: string;
  splitWord: string;
  arrowIndexWord: number; // индекс как указатель буквы искомого слова
  wholeContainer: HTMLElement;
  splitContainer: HTMLElement;
  run(word: string, splitWord: string, arrowIndexWord: number): void;
  answered(): void;
}

export class HTMLProcessBridge {
  constructor(private provider: IProvider) {}

  /**
   * Инициализация провайдера
   * @param word
   * @param splitWord
   * @param arrowIndexWord
   */
  public init(word: string, splitWord: string, arrowIndexWord: number = 0) {
    this.provider.run(word, splitWord, arrowIndexWord);
  }

  public answered() {
    this.provider.answered();
  }
}

export class DOMProvider implements IProvider {
  public template: Template;
  public word: string = "";
  public splitWord: string = "";
  public arrowIndexWord: number = 0; // Указатель на индекс слова, чтобы понимать какая буква на очереди

  constructor(
    public wholeContainer: HTMLElement,
    public splitContainer: HTMLElement
  ) {
    this.template = new Template();
  }

  /**
   * Запускаем процесс перетасовывания слова
   * @param word
   * @param splitWord
   * @param arrowIndexWord
   */
  public run(
    word: string,
    splitWord: string,
    arrowIndexWord: number = 0
  ): void {
    this.word = word;
    this.splitWord = splitWord;
    this.arrowIndexWord = arrowIndexWord;

    this.eventsListener().add();
    this.appendButtonsToSplitContainer();
  }

  /**
   * Добавляем кнопки с буквами для выбора
   */
  private appendButtonsToSplitContainer(): void {
    const word = this.splitWord.split("");
    const { template } = this.template.getTemplateByName("button")!;

    for (const char of word) {
      this.splitContainer.appendChild(template(char));
    }
  }

  /**
   * Храним обработчики событий для установки и удаления
   */
  private eventsListener() {
    const _this = this;

    return {
      add() {
        _this.splitContainer.addEventListener("click", _this);
        document.addEventListener("keypress", _this);
      },
      remove() {
        _this.splitContainer.removeEventListener("click", _this);
        document.removeEventListener("keypress", _this);
      },
    };
  }

  /**
   * Обработка событий без потери контекста
   * @param event
   */
  handleEvent(event) {
    if (event.type === "click") {
      this.clickSplitContainer(event);
    } else if (event.type === "keypress") {
      this.pressKey(event);
    }
  }

  /**
   * В случае успех перекладываем кнопку в другой контейнер и двигаем указатель
   * В случае провала сигналим о не верном ответе и отправляем событие в логгер
   * @param event
   * @private
   */
  private clickSplitContainer(event) {
    if (event.target.type === "button") {
      const buttonChar = event.target.dataset.char;
      const wordChar = this.word.charAt(this.arrowIndexWord);
      const isSiblingChars = this.checkCharacters(buttonChar, wordChar);

      this.checkAnswer(isSiblingChars, event.target);
    }
  }

  /**
   * Ловим нажатие на клавишу клавиатуры и ищем совпадение с текущей буквой слова
   * @param event
   * @private
   */
  private pressKey(event) {
    if (this.arrowIndexWord === this.word.length) return;

    const isAlpha = isAlphabetEN(event.charCode);

    if (isAlpha) {
      const isSiblingChars = this.checkCharacters(
        this.word.charAt(this.arrowIndexWord),
        event.key
      );

      const button = this.splitContainer.querySelector(
        `[data-char="${event.key}"]`
      );

      this.checkAnswer(isSiblingChars, button as HTMLElement | undefined);
    }
  }

  /**
   * Проверить букву из нажатой кнопки с буквой в текущем слове
   * @param currentChar
   * @param buttonChar
   * @private
   */
  private checkCharacters(currentChar: string, buttonChar: string): boolean {
    return currentChar === buttonChar;
  }

  /**
   * Проверка ответа
   * @param isSiblingChars
   * @param target
   * @private
   */
  private checkAnswer(
    isSiblingChars: boolean,
    target: HTMLElement | undefined
  ) {
    if (isSiblingChars) {
      console.log("Правильный ответ");
      if (target) this.moveButtonFromSplitToWholeContainer(target);
      this.sendNotice(CORRECT_ANSWER, this.word);
    } else {
      console.log("Не правильный ответ");
      if (target) this.changeOfErrorColorForTime(target);
      this.sendNotice(WRONG_ANSWER, this.word);
    }
  }

  /**
   * Закончить ответ досрочно
   */
  public answered() {
    this.forFailedToPaintCurrentButtonsWholeContainer(); // Покрасить успешные ответы
    this.forFailedToMoveAndPaintOtherButtonsWholeContainer(); // Переместить и покрасить оставшие варианты
  }

  /**
   * Покрасить кнопки успешных ответов
   */
  private forFailedToPaintCurrentButtonsWholeContainer() {
    const wholeButtons = this.wholeContainer.querySelectorAll("button");

    wholeButtons.forEach((button) => {
      button.classList.remove("btn-success");
      button.classList.add("btn-danger");
    });
  }

  /**
   * Перекладываем кнопки вверхний контейнер и красим их в красный
   * На последнем элементе переключаем на следующий вопрос
   */
  private forFailedToMoveAndPaintOtherButtonsWholeContainer() {
    for (let i = this.arrowIndexWord; i <= this.word.length; i++) {
      const button = this.splitContainer.querySelector(
        `[data-char="${this.word.charAt(i)}"]`
      )!;

      if (button) {
        const btn = this.splitContainer.removeChild(button);

        this.wholeContainer.appendChild(btn);

        setTimeout(() => {
          button.classList.remove("btn-primary");
          button.classList.add("btn-danger");

          // Если буква последняя – выбросить событие для переключения на следующий вопрос или статистику
          if (i === this.word.length - 1)
            setTimeout(() => {
              this.clearContainers();
              EventBus.publish(NEXT_ANSWERS, this.word);
            }, 1000);
        }, 100);
      }

      this.arrowIndexWord = i; // обновляем указатель на индекс для текущего слова
    }
  }

  /**
   * Отправляет события при выборе варианта ответа
   * @param event
   * @param word
   * @private
   */
  private sendNotice(event: string, word: string) {
    EventBus.publish(event, word);
  }

  /**
   * Переместить кнопку с правильным ответом из одного контейнера в другой и поменять цвет на btn-success
   * @param target
   */
  private moveButtonFromSplitToWholeContainer(target: HTMLElement) {
    const button = this.splitContainer.removeChild(target);

    this.arrowIndexWord++; // Увеличиваем указатель на индекс
    this.wholeContainer.appendChild(button);

    setTimeout(() => {
      button.classList.remove("btn-primary");
      button.classList.add("btn-success");

      if (this.word.length === this.arrowIndexWord) {
        console.log("Слово разгадано");
        this.clearContainers();
        EventBus.publish(NEXT_ANSWERS, this.word);
      }
    }, 100);
  }

  /**
   * Добавить/удалить btn-danger как показатель выбранного не правильного ответа на 100ms
   * @param target
   */
  private changeOfErrorColorForTime(target: HTMLElement) {
    target.classList.add("btn-danger");

    setTimeout(() => {
      target.classList.remove("btn-danger");
    }, 100);
  }

  /**
   * Очистка контейнера для перемешанных букв
   * @private
   */
  private clearSplitContainer() {
    this.splitContainer.innerHTML = "";
  }

  /**
   * Очистка контейнера для ответа
   * @private
   */
  private clearWholeContainer() {
    this.wholeContainer.innerHTML = "";
  }

  /**
   * Очистка обоих контейнеров
   */
  public clearContainers() {
    this.eventsListener().remove();

    this.clearSplitContainer();
    this.clearWholeContainer();
  }
}
