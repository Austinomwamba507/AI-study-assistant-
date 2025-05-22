document.getElementById("card-form").addEventListener("submit", function (e) {
  e.preventDefault(); 

  const question = document.getElementById("question").value;
  const answer = document.getElementById("answer").value;

  if (question && answer) {
    createCard(question, answer);
    document.getElementById("question").value = "";
    document.getElementById("answer").value = "";
  }
});

function createCard(question, answer) {
  const container = document.getElementById("flashcards-container");

  const card = document.createElement("div");
  card.className = "card";

  const front = document.createElement("div");
  front.className = "front";
  front.textContent = question;

  const back = document.createElement("div");
  back.className = "back";
  back.textContent = answer;
  back.style.display = "none";

  card.appendChild(front);
  card.appendChild(back);

  card.onclick = () => {
    if (front.style.display !== "none") {
      front.style.display = "none";
      back.style.display = "block";
    } else {
      front.style.display = "block";
      back.style.display = "none";
    }
  };

  container.appendChild(card);
}
document.getElementById("generate-ai").addEventListener("click", async () => {
  const slideText = document.getElementById("slide-text").value;
  if (!slideText.trim()) {
    alert("Please enter slide text.");
    return;
  }

  try {
    const rawFlashcards = await generateFlashcards(slideText);
    const flashcards = JSON.parse(rawFlashcards);

    flashcards.forEach(({ question, answer }) => {
      createCard(question, answer);
    });
  } catch (error) {
    console.error(error);
    alert("Failed to generate flashcards. Check the console for details.");
  }
});

async function generateFlashcards(slideText) {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "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",
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are an assistant that creates study flashcards.",
        },
        {
          role: "user",
          content: `Turn this text into 3 flashcards with JSON format [{"question": "...", "answer": "..."}]:\n\n${slideText}`,
        },
      ],
      max_tokens: 500,
      temperature: 0.7,
    }),
  });

  const data = await response.json();
  return data.choices[0].message.content;
}
document.getElementById("process-pptx").addEventListener("click", async () => {
  const fileInput = document.getElementById("pptx-upload");
  const file = fileInput.files[0];

  if (!file) {
    alert("Please select a .pptx file.");
    return;
  }

  try {
    const arrayBuffer = await file.arrayBuffer();
    const parser = new PPTXParser();
    const text = await parser.extractText(arrayBuffer);

    if (!text || !text.length) {
      alert("No text found in the PowerPoint file.");
      return;
    }

    const combinedText = text.map(slide => slide.text).join("\n\n");

    const rawFlashcards = await generateFlashcards(combinedText);
    const flashcards = JSON.parse(rawFlashcards);

    flashcards.forEach(({ question, answer }) => {
      createCard(question, answer);
    });
  } catch (error) {
    console.error("Error processing PowerPoint file:", error);
    alert("Failed to process the PowerPoint file. Please check the console for details.");
  }
});
