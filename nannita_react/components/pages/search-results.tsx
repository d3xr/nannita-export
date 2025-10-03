import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from 'lucide-react';
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import NannyGrid from "@/components/NannyGrid";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { useFeatureFlag } from "@/hooks/useFeatureFlag";
import { isV2EligibleRoute } from "@/utils/v2Routes";

interface Nanny {
  id: string;
  slug?: string;
  name: string;
  age: number;
  rating: number;
  reviews: number;
  location: string;
  service: string;
  additionalServices?: string;
  price: string;
  image: string;
  rateOneChild?: number;
  rateTwoChildren?: number;
  monthlyRate?: number;
}

export default function SearchResultsPage() {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 100;
  const isMobile = useIsMobile();
  const { isEnabled: isV2Enabled } = useFeatureFlag('MOBILE_V2');
  const shouldUseV2 = isMobile && isV2Enabled && isV2EligibleRoute(location);

  // Загружаем верифицированных специалистов с пагинацией
  const { data: response, isLoading, error } = useQuery<{nannies: Nanny[], total: number, page: number, totalPages: number}>({
    queryKey: ['/api/nannies/verified', currentPage, ITEMS_PER_PAGE],
    queryFn: async () => {
      const res = await fetch(`/api/nannies/verified?page=${currentPage}&limit=${ITEMS_PER_PAGE}`);
      if (!res.ok) throw new Error('Failed to fetch nannies');
      return res.json();
    }
  });

  const nannies = response?.nannies || [];
  const totalPages = response?.totalPages || 1;
  const totalCount = response?.total || 0;

  useEffect(() => {
    document.title = "Каталог специалистов — Nannita";
    window.scrollTo(0, 0);
  }, []);

  // Фильтрация по поиску с защитой от ошибок
  const filteredNannies = nannies.filter(nanny => {
    if (searchTerm === "") return true;
    
    const searchLower = searchTerm.toLowerCase();
    const matchesName = nanny.name?.toLowerCase()?.includes(searchLower) || false;
    const matchesService = nanny.service?.toLowerCase()?.includes(searchLower) || false;
    const matchesLocation = nanny.location?.toLowerCase()?.includes(searchLower) || false;
    const matchesAdditional = nanny.additionalServices?.toLowerCase()?.includes(searchLower) || false;
    
    return matchesName || matchesService || matchesLocation || matchesAdditional;
  });

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50">
        {!shouldUseV2 && <Header />}
        <main className="container mx-auto px-4 py-8 mt-20">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Ошибка загрузки</h1>
            <p className="text-gray-600">Не удалось загрузить список специалистов</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {!shouldUseV2 && <Header />}
      
      {/* Секция специалистов точно как на главной странице */}
      <section className="pt-20 pb-8 md:pt-24 md:pb-12">
        <div className="container-lg">
          <div className="text-center mb-12">
            <h1 className="text-3xl font-heading font-medium mb-4 text-nannita-blue-dark">
              Проверенные няни и специалисты по уходу за детьми
            </h1>
            <p className="text-gray-600 text-lg container-sm">
              {totalCount} проверенных специалистов готовы помочь
            </p>
          </div>
          
          {/* Сетка специалистов точно как на главной */}
          <NannyGrid 
            nannies={nannies} 
            isLoading={isLoading}
            showFilters={false}
            maxItems={ITEMS_PER_PAGE}
          />
          
          {/* Кнопки внизу как на главной */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              onClick={() => setLocation("/")}
              variant="outline"
              className="rounded-xl px-8 py-3 border-2 border-nannita-orange text-nannita-orange hover:bg-nannita-orange hover:text-white transition-colors w-full sm:w-auto"
              data-testid="button-home"
            >
              На главную
            </Button>
            
            <Button 
              onClick={() => setLocation("/order")}
              className="rounded-xl px-8 py-3 bg-nannita-orange text-white hover:bg-orange-600 transition-colors w-full sm:w-auto"
              data-testid="button-create-order"
            >
              Создать заказ
            </Button>
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
}