import { lazy, Suspense } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Skeleton } from "@/components/ui/Skeleton";

const NoteEditorScreen = lazy(() =>
  import("@/features/library/screens/NoteEditorScreen").then((m) => ({
    default: m.NoteEditorScreen,
  })),
);

export const Route = createFileRoute(
  "/_authenticated/library/notes/$noteId",
)({
  component: NoteRoute,
});

function NoteRoute() {
  const { noteId } = Route.useParams();
  return (
    <Suspense fallback={<Skeleton className="h-10 w-64" />}>
      <NoteEditorScreen noteId={noteId} />
    </Suspense>
  );
}
