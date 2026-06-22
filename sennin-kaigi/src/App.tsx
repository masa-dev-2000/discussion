import { useState } from "react";
import type { Discussion } from "./types";
import { SEED_DISCUSSIONS } from "./data/discussions";
import { useRoute, navigate } from "./router";
import { DiscussionList } from "./pages/DiscussionList";
import { DiscussionSetup, type NewDiscussionInput } from "./pages/DiscussionSetup";
import { Arena } from "./pages/Arena";

export default function App() {
  const route = useRoute();
  const [discussions, setDiscussions] = useState<Discussion[]>(SEED_DISCUSSIONS);

  const createDiscussion = (input: NewDiscussionInput) => {
    const id = "d" + Date.now().toString(36);
    const d: Discussion = {
      id,
      ...input,
      status: "draft",
      createdAt: new Date().toISOString().slice(0, 10),
      utterances: [],
      summary: "",
      keyPoints: [],
    };
    setDiscussions((list) => [d, ...list]);
    navigate(`/d/${id}`);
  };

  const updateDiscussion = (id: string, patch: Partial<Discussion>) =>
    setDiscussions((list) =>
      list.map((d) => (d.id === id ? { ...d, ...patch } : d))
    );

  let body;
  if (route.name === "setup") {
    body = <DiscussionSetup onCreate={createDiscussion} />;
  } else if (route.name === "arena") {
    const d = discussions.find((x) => x.id === route.id);
    body = d ? (
      <Arena key={d.id} discussion={d} onUpdate={updateDiscussion} />
    ) : (
      <section className="page">
        <p className="muted">
          議論が見つかりません。{" "}
          <a className="link" href="#/">
            一覧へ
          </a>
        </p>
      </section>
    );
  } else {
    body = <DiscussionList discussions={discussions} />;
  }

  return (
    <div className="app">
      <header className="app__header">
        <a className="app__brand" href="#/">
          <span className="app__seal">會</span>
          <div>
            <h1 className="app__title">先人会議</h1>
            <p className="app__sub">Council of the Ancients — 時を超えた知性の討論</p>
          </div>
        </a>
      </header>
      {body}
    </div>
  );
}
