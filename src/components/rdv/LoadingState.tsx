
import { Navbar } from "@/components/ui/navbar";

export const LoadingState = () => {
  return (
    <>
      <Navbar />
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Chargement...</p>
          </div>
        </div>
      </div>
    </>
  );
};
