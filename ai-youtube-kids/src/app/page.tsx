"use client";

import { FormEvent, useMemo, useState } from "react";
import styles from "./page.module.css";

type TonePreset =
  | "Playful & Silly"
  | "Curious Explorer"
  | "Superhero Mentor"
  | "Calm Storyteller";

type CadencePreset = "Daily" | "3 videos / week" | "Weekly";

interface AgentFormState {
  channelName: string;
  topic: string;
  targetAge: string;
  learningOutcome: string;
  tone: TonePreset;
  heroCharacter: string;
  runtimeSeconds: number;
  callToAction: string;
  cadence: CadencePreset;
  extraNotes: string;
  creativity: number;
}

interface AgentScene {
  beat: string;
  timing: string;
  narration: string;
  visuals: string;
  soundDesign: string;
}

interface AgentResponse {
  headline: string;
  hook: string;
  storyline: AgentScene[];
  script: string;
  educationalMoments: string[];
  callToAction: string;
  safetyChecklist: string[];
  metadata: {
    description: string;
    hashtags: string[];
    keywords: string[];
    publishingTip: string;
  };
  thumbnailConcepts: string[];
  repurposingIdeas: string[];
}

const defaultForm: AgentFormState = {
  channelName: "",
  topic: "",
  targetAge: "Ages 5-8",
  learningOutcome: "",
  tone: "Playful & Silly",
  heroCharacter: "",
  runtimeSeconds: 45,
  callToAction: "Subscribe for more adventures!",
  cadence: "3 videos / week",
  extraNotes: "",
  creativity: 0.6,
};

const toneEmojis: Record<TonePreset, string> = {
  "Playful & Silly": "🎉",
  "Curious Explorer": "🧭",
  "Superhero Mentor": "🦸",
  "Calm Storyteller": "🌙",
};

const cadenceCopy: Record<CadencePreset, string> = {
  Daily: "🚀 Daily Drops",
  "3 videos / week": "🌟 Steady Growth",
  Weekly: "🌈 Quality Weekly",
};

function formatSeconds(seconds: number) {
  const safe = Math.max(15, Math.min(90, seconds));
  return `${safe.toFixed(0)}s`;
}

export default function Home() {
  const [formState, setFormState] = useState<AgentFormState>(defaultForm);
  const [result, setResult] = useState<AgentResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const scenePreview = useMemo(
    () => result?.storyline.slice(0, 3) ?? [],
    [result?.storyline],
  );

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);
    setResult(null);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formState),
      });

      if (!response.ok) {
        const errorPayload = await response.json().catch(() => ({}));
        throw new Error(
          errorPayload?.error ?? "Something went wrong. Please try again.",
        );
      }

      const payload: AgentResponse = await response.json();
      setResult(payload);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "We hit a snag creating the short. Give it another go!";
      setErrorMessage(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = <Key extends keyof AgentFormState>(
    key: Key,
    value: AgentFormState[Key],
  ) => {
    setFormState((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleReset = () => {
    setFormState(defaultForm);
    setResult(null);
    setErrorMessage(null);
  };

  const handleCopy = async (text: string) => {
    if (typeof navigator === "undefined" || !navigator.clipboard) return;
    try {
      await navigator.clipboard.writeText(text);
      setErrorMessage("Copied to clipboard!");
      setTimeout(() => setErrorMessage(null), 2500);
    } catch (error) {
      console.error("Copy failed", error);
    }
  };

  return (
    <main className={styles.main}>
      <section className={styles.hero}>
        <span className={styles.tag}>✨ Kids Shorts Creative Agent</span>
        <h1>
          Launch magical YouTube Kids shorts{" "}
          <span className={styles.highlight}>on autopilot</span>
        </h1>
        <p>
          Feed the agent your channel details and get a complete, kid-safe short
          with hooks, scenes, voiceover, metadata, thumbnails, and more — ready
          to post.
        </p>
      </section>

      <section className={styles.canvas}>
        <form className={styles.form} onSubmit={handleSubmit}>
          <header className={styles.formHeader}>
            <div>
              <h2>Creative Brief</h2>
              <p>Describe the short you want. The agent handles the rest.</p>
            </div>
            <button
              type="button"
              className={styles.resetButton}
              onClick={handleReset}
              disabled={isLoading}
            >
              Reset
            </button>
          </header>

          <div className={styles.formGrid}>
            <label className={styles.field}>
              <span>Channel name</span>
              <input
                type="text"
                placeholder="WonderKids Explorers"
                value={formState.channelName}
                onChange={(event) =>
                  handleChange("channelName", event.target.value)
                }
                required
              />
            </label>

            <label className={styles.field}>
              <span>Short idea</span>
              <input
                type="text"
                placeholder="Why do chameleons change colors?"
                value={formState.topic}
                onChange={(event) =>
                  handleChange("topic", event.target.value)
                }
                required
              />
            </label>

            <label className={styles.field}>
              <span>Target age group</span>
              <select
                value={formState.targetAge}
                onChange={(event) =>
                  handleChange("targetAge", event.target.value)
                }
              >
                <option>Ages 3-5</option>
                <option>Ages 5-8</option>
                <option>Ages 7-10</option>
                <option>Ages 9-12</option>
              </select>
            </label>

            <label className={styles.field}>
              <span>Learning takeaway</span>
              <input
                type="text"
                placeholder="Teach kids how camouflage works in nature."
                value={formState.learningOutcome}
                onChange={(event) =>
                  handleChange("learningOutcome", event.target.value)
                }
              />
            </label>

            <label className={styles.field}>
              <span>Hero / host</span>
              <input
                type="text"
                placeholder="Sunny the Science Gecko"
                value={formState.heroCharacter}
                onChange={(event) =>
                  handleChange("heroCharacter", event.target.value)
                }
              />
            </label>

            <label className={styles.field}>
              <span>Channel cadence</span>
              <select
                value={formState.cadence}
                onChange={(event) =>
                  handleChange("cadence", event.target.value as CadencePreset)
                }
              >
                <option value="Daily">{cadenceCopy.Daily}</option>
                <option value="3 videos / week">
                  {cadenceCopy["3 videos / week"]}
                </option>
                <option value="Weekly">{cadenceCopy.Weekly}</option>
              </select>
            </label>

            <label className={styles.field}>
              <span>Tone</span>
              <select
                value={formState.tone}
                onChange={(event) =>
                  handleChange("tone", event.target.value as TonePreset)
                }
              >
                {Object.entries(toneEmojis).map(([tone, emoji]) => (
                  <option key={tone} value={tone}>
                    {emoji} {tone}
                  </option>
                ))}
              </select>
            </label>

            <label className={styles.field}>
              <span>Call to action</span>
              <input
                type="text"
                placeholder="Subscribe for more mini science missions!"
                value={formState.callToAction}
                onChange={(event) =>
                  handleChange("callToAction", event.target.value)
                }
              />
            </label>
          </div>

          <div className={styles.row}>
            <label className={styles.sliderField}>
              <div>
                <span>Runtime focus</span>
                <p>
                  {formatSeconds(formState.runtimeSeconds)} target — optimized
                  for Shorts retention
                </p>
              </div>
              <input
                type="range"
                min={15}
                max={90}
                step={5}
                value={formState.runtimeSeconds}
                onChange={(event) =>
                  handleChange("runtimeSeconds", Number(event.target.value))
                }
              />
              <div className={styles.sliderLabels}>
                <span>15s</span>
                <span>45s</span>
                <span>90s</span>
              </div>
            </label>

            <label className={styles.sliderField}>
              <div>
                <span>Creative energy</span>
                <p>
                  {formState.creativity >= 0.7
                    ? "Wild & whimsical"
                    : formState.creativity <= 0.4
                      ? "Safe & structured"
                      : "Balanced storytelling"}
                </p>
              </div>
              <input
                type="range"
                min={0}
                max={1}
                step={0.1}
                value={formState.creativity}
                onChange={(event) =>
                  handleChange("creativity", Number(event.target.value))
                }
              />
              <div className={styles.sliderLabels}>
                <span>Mild</span>
                <span>Magic</span>
              </div>
            </label>
          </div>

          <label className={styles.fieldWide}>
            <span>Must-have notes</span>
            <textarea
              rows={4}
              placeholder="Keep everything COPPA-safe. Mention that colors change for communication and safety. Include sing-along moment."
              value={formState.extraNotes}
              onChange={(event) =>
                handleChange("extraNotes", event.target.value)
              }
            />
          </label>

          <button type="submit" className={styles.submit} disabled={isLoading}>
            {isLoading ? "Crafting your short..." : "Generate kids short plan"}
          </button>
          {errorMessage && (
            <p className={styles.inlineNotice}>{errorMessage}</p>
          )}
        </form>

        <aside className={styles.preview}>
          <h3>Quick preview</h3>
          {result ? (
            <div className={styles.previewCard}>
              <span className={styles.previewTag}>{result.headline}</span>
              <p>{result.hook}</p>
              <ul>
                {scenePreview.map((scene) => (
                  <li key={scene.beat}>
                    <span>{scene.timing}</span>
                    <strong>{scene.beat}</strong>
                    <small>{scene.narration}</small>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p className={styles.previewEmpty}>
              Your first three scenes will appear here after generation. Perfect
              to sanity check the pacing at a glance.
            </p>
          )}
        </aside>
      </section>

      {result && (
        <section className={styles.results}>
          <header>
            <h2>{result.headline}</h2>
            <p>{result.hook}</p>
          </header>

          <article className={styles.card}>
            <div className={styles.cardHeader}>
              <h3>Storyboard & beats</h3>
              <button
                type="button"
                onClick={() =>
                  handleCopy(
                    result.storyline
                      .map(
                        (scene, index) =>
                          `${index + 1}. [${scene.timing}] ${scene.beat}\nNarration: ${scene.narration}\nVisuals: ${scene.visuals}\nSound design: ${scene.soundDesign}`,
                      )
                      .join("\n\n"),
                  )
                }
              >
                Copy beats
              </button>
            </div>
            <ul className={styles.sceneList}>
              {result.storyline.map((scene, index) => (
                <li key={scene.beat + index}>
                  <header>
                    <span className={styles.sceneIndex}>
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <div>
                      <strong>{scene.beat}</strong>
                      <small>{scene.timing}</small>
                    </div>
                  </header>
                  <p>
                    <strong>Voiceover</strong>: {scene.narration}
                  </p>
                  <p>
                    <strong>Visuals</strong>: {scene.visuals}
                  </p>
                  <p>
                    <strong>Sound design</strong>: {scene.soundDesign}
                  </p>
                </li>
              ))}
            </ul>
          </article>

          <article className={styles.card}>
            <div className={styles.cardHeader}>
              <h3>Editable script</h3>
              <button type="button" onClick={() => handleCopy(result.script)}>
                Copy script
              </button>
            </div>
            <pre className={styles.scriptBlock}>{result.script}</pre>
          </article>

          <article className={styles.card}>
            <div className={styles.cardHeader}>
              <h3>Educational beats</h3>
            </div>
            <ul className={styles.pillList}>
              {result.educationalMoments.map((moment) => (
                <li key={moment}>{moment}</li>
              ))}
            </ul>
          </article>

          <article className={styles.card}>
            <div className={styles.cardHeader}>
              <h3>Safety & delivery</h3>
              <span className={styles.badge}>KidSAFE</span>
            </div>
            <ul className={styles.checkList}>
              {result.safetyChecklist.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <p className={styles.callout}>
              CTA: <strong>{result.callToAction}</strong>
            </p>
          </article>

          <article className={styles.card}>
            <div className={styles.cardHeader}>
              <h3>Metadata bundle</h3>
              <button
                type="button"
                onClick={() =>
                  handleCopy(
                    [
                      result.metadata.description,
                      "",
                      `Hashtags: ${result.metadata.hashtags.join(" ")}`,
                      `Keywords: ${result.metadata.keywords.join(", ")}`,
                      `Publishing tip: ${result.metadata.publishingTip}`,
                    ].join("\n"),
                  )
                }
              >
                Copy metadata
              </button>
            </div>
            <p>{result.metadata.description}</p>
            <div className={styles.metadataRow}>
              <div>
                <h4>Hashtags</h4>
                <div className={styles.chipRow}>
                  {result.metadata.hashtags.map((tag) => (
                    <span key={tag} className={styles.chip}>
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <h4>Keywords</h4>
                <div className={styles.chipRow}>
                  {result.metadata.keywords.map((keyword) => (
                    <span key={keyword} className={styles.chip}>
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <p className={styles.tip}>{result.metadata.publishingTip}</p>
          </article>

          <article className={styles.card}>
            <div className={styles.cardHeader}>
              <h3>Thumbnail sparks</h3>
            </div>
            <ul className={styles.orderedList}>
              {result.thumbnailConcepts.map((concept, index) => (
                <li key={concept}>
                  <span>{index + 1}.</span>
                  <p>{concept}</p>
                </li>
              ))}
            </ul>
          </article>

          <article className={styles.card}>
            <div className={styles.cardHeader}>
              <h3>Repurposing fuel</h3>
            </div>
            <ul className={styles.checkList}>
              {result.repurposingIdeas.map((idea) => (
                <li key={idea}>{idea}</li>
              ))}
            </ul>
          </article>
        </section>
      )}
    </main>
  );
}
