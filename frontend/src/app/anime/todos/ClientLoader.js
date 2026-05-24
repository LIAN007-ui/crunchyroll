"use client";

import dynamic from 'next/dynamic';

const ClientTodosDynamic = dynamic(() => import('./ClientTodos'), { ssr: false });

export default function ClientLoader() {
  return <ClientTodosDynamic />;
}
