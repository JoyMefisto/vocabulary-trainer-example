export const WRONG_ANSWER = "wrong-answer"; // Не верный ответа
export const CORRECT_ANSWER = "correct-answer"; // Верный ответа
export const NEXT_ANSWERS = "next-answers"; // Слова выбраны полностью
export const EARLY_STOP = "early-stop"; // Досрочная остановка

/**
 * Пример:
 *
 * const callback = (message) => {
 * 	console.log('message', message)
 * }
 * EventBus.subscribe(NEXT_ANSWERS, callback) // создание событие и запись коллбэка
 * EventBus.publish(NEXT_ANSWERS, { animal: 'Butterfly' }) // триггерим колбэки по событию { animal: 'Butterfly' }
 *
 * EventBus.unsubscribe(NEXT_ANSWERS, callback) // удаляем колбэк из события
 * EventBus.publish(NEXT_ANSWERS, { animal: 'Tiger' }) // не покажется
 */
export const EventBus = {
  events: {},
  /**
   * Подписаться на событие - добавить его в список событий
   * @param eventName
   * @param callback
   */
  subscribe(eventName: string, callback: Function) {
    if (!this.events[eventName]) {
      this.events[eventName] = [];
    }

    this.events[eventName].push(callback);
  },
  /**
   * Триггер события
   * @param eventName
   * @param params
   */
  publish(eventName: string, params: unknown) {
    const events = this.events[eventName];

    if (!events || !events.length) return;

    events.forEach((callback) => callback(params));
  },
  /**
   * Отписаться от события
   * @param eventName
   * @param callback
   */
  unsubscribe(eventName: string, callback: Function) {
    const events = this.events[eventName];
    if (!events || !events.length) return;

    const indexCallback = events.indexOf(callback);
    if (indexCallback !== -1) {
      events.splice(indexCallback, 1);
    }
  },
};
