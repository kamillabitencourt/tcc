const { onRequest } = require("firebase-functions/v2/https");
const { defineSecret } = require("firebase-functions/params");
const OpenAI = require("openai");

const OPENAI_KEY = defineSecret("OPENAI_KEY");

exports.describeEnvironment = onRequest(
  {
    secrets: [OPENAI_KEY],
  },
  async (req, res) => {
    try {
      const imageBase64 = req.body.image;

      const openai = new OpenAI({
        apiKey: OPENAI_KEY.value(),
      });

      const response =
        await openai.chat.completions.create({
          model: "gpt-4o",
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text:
                    "Descreva este ambiente para uma pessoa com deficiência visual. Informe obstáculos, pessoas, objetos importantes, portas, escadas, veículos e possíveis riscos.",
                },
                {
                  type: "image_url",
                  image_url: {
                    url: `data:image/jpeg;base64,${imageBase64}`,
                  },
                },
              ],
            },
          ],
        });

      res.json({
        description:
          response.choices[0].message.content,
      });
    } catch (error) {
      console.error(error);

      res.status(500).json({
        error: error.message,
      });
    }
  }
);