import { redirect } from 'next/navigation';

export default function AnimeListPage() {
  // Redirect to browse filtered for anime
  redirect('/browse?type=ANIME');
}
