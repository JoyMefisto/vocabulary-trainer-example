/**
 * Функция - которая в рандомном порядке возвращает указанное количество элементов из переданного списка
 * Если в переданном списке элементов меньше чем нужно – вернуть исключение.
 * @param elements
 * @param count
 */
export function randomElementList(
  elements: string[] = [],
  count: number = 0
): string[] {
  if (elements.length === 0 || count === 0)
    throw new Error("Не указаны элементы или их количество");
  if (elements.length < count)
    throw new Error("Элементов в списке меньше, чем указанное количество");

  const listElements: string[] = elements.slice(0);
  const result: string[] = [];

  for (let i = 0; i < count; i++) {
    const countElements = listElements.length;
    const index = Math.floor(Math.random() * countElements);
    const word = listElements.splice(index, 1).join();

    result.push(word);
  }

  return result;
}
