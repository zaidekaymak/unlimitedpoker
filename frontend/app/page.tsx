import { CreateRoomForm } from "@/components/CreateRoomForm";
import { JoinRoomForm } from "@/components/JoinRoomForm";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-50 to-gray-100 dark:from-gray-950 dark:to-gray-900 flex items-center justify-center p-6">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100">🃏 Planning Poker</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">Ekibinizle gerçek zamanlı tahmin yapın</p>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-md p-8 border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-6">Yeni Oda Oluştur</h2>
            <CreateRoomForm />
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-md p-8 border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-6">Mevcut Odaya Katıl</h2>
            <JoinRoomForm />
          </div>
        </div>
      </div>
    </main>
  );
}
