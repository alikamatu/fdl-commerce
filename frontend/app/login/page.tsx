import { CheckoutAuth } from "@/components/checkout/CheckoutAuth";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

     const handleContinueAsGuest = () => {
    router.push('/checkout');
   };

   const handleAuthSuccess = () => {
    router.push('/checkout');
   };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <CheckoutAuth
        onSuccess={handleAuthSuccess}
        onContinueAsGuest={handleContinueAsGuest}
      />
    </div>
  );
}
