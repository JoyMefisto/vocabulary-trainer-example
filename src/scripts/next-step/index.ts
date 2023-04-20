/**
 * Класс для манипуляции шагов между вопросами
 */
export class NextStep {
  constructor(
    public firstStep: HTMLElement,
    public lastStep: HTMLElement,
    public containerPagination: HTMLElement,
    public firstNumber: number,
    public lastNumber: number
  ) {
    this.updateTextElement(this.firstStep, this.firstNumber);
    this.updateTextElement(this.lastStep, this.lastNumber);
  }

  /**
   * Сделать следующий шаг
   */
  next(): void {
    if (this.firstNumber < this.lastNumber) {
      this.firstNumber++;
      this.updateTextElement(this.firstStep, this.firstNumber);
    }
  }

  /**
   * Вернуться на шаг назад
   */
  prev(): void {
    if (this.firstNumber <= this.lastNumber && this.firstNumber !== 0) {
      this.firstNumber--;
      this.updateTextElement(this.firstStep, this.firstNumber);
    }
  }

  /**
   * Оюновить номер шага
   * @param element
   * @param text
   */
  updateTextElement(element: HTMLElement, text: number): void {
    element.innerHTML = String(text);
  }

  /**
   * Показать блок с пагинацией
   */
  showPagination() {
    this.containerPagination.style.opacity = "1";
  }

  /**
   * Спрятать блок с пагинацией
   */
  hidePagination() {
    this.containerPagination.style.opacity = "0";
  }
}
