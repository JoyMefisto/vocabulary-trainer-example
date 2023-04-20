import { randomElementList } from "./utils/random-element-list";
import { TrainerFacade } from "./scripts/trainer-facade";
import { words } from "./constants";

const MAX_QUESTION = 6;

/*
 * Выбираем слова рандомно из списка
 */
let collectionWords: string[] = [];
try {
  collectionWords = randomElementList(words, MAX_QUESTION);
} catch (e) {
  if (e instanceof Error) {
    console.warn(e.message);
  }
}

const containerPagination = document.getElementById("pagination")!;
const containerCurrentQuestion = document.getElementById("current_question")!;
const containerTotalQuestions = document.getElementById("total_questions")!;
const containerWholeWord = document.getElementById("whole_word")!;
const containerSpreadWord = document.getElementById("spread_word")!;
const containerNotifyResult = document.getElementById("notify_result")!;

if (
  collectionWords.length &&
  containerPagination &&
  containerCurrentQuestion &&
  containerTotalQuestions &&
  containerWholeWord &&
  containerSpreadWord &&
  containerNotifyResult
) {
  const command = new TrainerFacade(
    collectionWords,
    containerWholeWord,
    containerSpreadWord,
    containerPagination,
    containerCurrentQuestion,
    containerTotalQuestions,
    containerNotifyResult
  );

  command.init();
}
