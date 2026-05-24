import { redirect } from 'next/navigation';

export default function MangaListPage() {
  // Redirect to browse filtered for manga
  redirect('/browse?type=MANGA');
}
