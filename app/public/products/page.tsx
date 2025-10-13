'use client';

import { useState, useEffect, Suspense } from 'react';
import type { SVGProps } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from "next/image";
import Link from "next/link";
import { ProductsControlsClient } from "@/components/products/ProductsControlsClient";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Pagination, PaginationContent, PaginationItem, PaginationLink } from "@/components/ui/pagination";
import { Loader2 } from "lucide-react";
import { productApi } from '@/lib/api/products_safe';
import { toast } from 'sonner';
import type { Product } from '@/types/database';
import { buildProductSlug } from '@/lib/utils/productSlug';

const PRODUCTS_PER_PAGE = 12;

// Helper function to validate image URLs
const isValidImageUrl = (url: string | null | undefined): boolean => {
  if (!url || typeof url !== 'string') return false;
  
  // Check if it's a valid HTTP/HTTPS URL
  try {
    const parsedUrl = new URL(url);
    return parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:';
  } catch {
    return false;
  }
};

// Helper function to get a valid image URL or fallback
const getValidImageUrl = (url: string | null | undefined, fallback?: string): string | null => {
  return isValidImageUrl(url) ? (url as string) : (fallback || null);
};

// Map category names from URL to database
const categoryMapping: Record<string, string> = {
  'aros': 'aros',
  'collares': 'collares', 
  'anillos': 'anillos',
  'pulseras': 'pulseras',
  'piercings': 'piercings',
  'accesorios': 'accesorios'
};

// Map material names from URL to database
const materialMapping: Record<string, string> = {
  'acero-quirurgico': 'Acero quirúrgico',
  'acero-blanco': 'Acero blanco',
  'acero-dorado': 'Acero dorado',
  'acero-inoxidable': 'Acero inoxidable',
  'plata-925': 'Plata 925',
  'plata': 'Plata',
  'oro-blanco': 'Oro blanco',
  'titanio': 'Titanio',
  'aleaciones': 'Aleaciones',
  'varios-materiales': 'Varios materiales',
  // Legacy mappings for backward compatibility
  'blanco': 'blanco',
  'dorado': 'dorado',
  'quirurgico': 'Acero quirúrgico'
};

const ArrowLeftIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    {...props}
  >
    <path d="M15 18l-6-6 6-6" />
  </svg>
);

const ArrowRightIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    {...props}
  >
    <path d="M9 6l6 6-6 6" />
  </svg>
);

function ProductsContent() {
  const searchParams = useSearchParams();
  
  // State management
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [subcategories, setSubcategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [currentPage, setCurrentPage] = useState(1);

  // Get URL parameters
  const categoryParam = searchParams?.get('category') || '';
  const materialParam = searchParams?.get('material') || '';
  const sortParam = searchParams?.get('sort') || '';
  const pageParam = searchParams?.get('page') || '1';
  const minPriceParam = searchParams?.get('minPrice') || '';
  const maxPriceParam = searchParams?.get('maxPrice') || '';

  // Load initial data
  useEffect(() => {
    loadData();
  }, []);

  // Filter products when parameters change
  useEffect(() => {
    filterProducts();
  }, [products, categoryParam, materialParam, sortParam, minPriceParam, maxPriceParam]);

  // Update page when pageParam changes
  useEffect(() => {
    const page = parseInt(pageParam);
    setCurrentPage(isNaN(page) || page < 1 ? 1 : page);
  }, [pageParam]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [productsRes, categoriesRes, subcategoriesRes] = await Promise.all([
        productApi.products.getAll({ includeInactive: true }),
        productApi.categories.getAll(),
        productApi.subcategories.getAll()
      ]);

      if (productsRes.success && productsRes.data) {
        setProducts(productsRes.data);
      }

      if (categoriesRes.success && categoriesRes.data) {
        setCategories(categoriesRes.data);
      }

      if (subcategoriesRes.success && subcategoriesRes.data) {
        setSubcategories(subcategoriesRes.data);
      }

    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Error cargando datos');
    } finally {
      setLoading(false);
    }
  };

  const filterProducts = () => {
    let filtered = [...products];

    // Filter by category
    if (categoryParam) {
      const categoryName = categoryMapping[categoryParam.toLowerCase()];
      if (categoryName) {
        const category = categories.find(c => c.name.toLowerCase() === categoryName.toLowerCase());
        if (category) {
          filtered = filtered.filter(p => p.category_id === category.id);
        }
      }
    }

    // Filter by material/subcategory
    if (materialParam) {
      const materialName = materialMapping[materialParam.toLowerCase()] || materialParam;

      // Find subcategories that match the material name (case-insensitive, partial matches)
      const matchingSubcategories = subcategories.filter(s => {
        const subcategoryName = s.name.toLowerCase();
        const searchTerm = materialName.toLowerCase();

        // Exact match
        if (subcategoryName === searchTerm) return true;

        // Partial match (material name contains subcategory or vice versa)
        if (subcategoryName.includes(searchTerm) || searchTerm.includes(subcategoryName)) return true;

        // Handle "Acero" prefix variations
        if (searchTerm.startsWith('acero ') && subcategoryName === searchTerm.replace('acero ', '')) return true;
        if (subcategoryName === 'acero' && searchTerm.includes('acero')) return true;

        return false;
      });

      if (matchingSubcategories.length > 0) {
        const subcategoryIds = matchingSubcategories.map(s => s.id);
        filtered = filtered.filter(p => p.subcategory_id && subcategoryIds.includes(p.subcategory_id));
      }
    }

    // Filter by price range
    if (minPriceParam) {
      const minPrice = parseFloat(minPriceParam);
      if (!isNaN(minPrice)) {
        filtered = filtered.filter(p => (p.price || 0) >= minPrice);
      }
    }

    if (maxPriceParam) {
      const maxPrice = parseFloat(maxPriceParam);
      if (!isNaN(maxPrice)) {
        filtered = filtered.filter(p => (p.price || 0) <= maxPrice);
      }
    }

    // Sort products
    const sortKey = sortParam.toLowerCase();
    switch (sortKey) {
      case 'nombre':
      case 'name':
        filtered.sort((a, b) => (a.name || '').localeCompare(b.name || '', 'es', { sensitivity: 'base' }));
        break;
      case 'nombre-desc':
      case 'name-desc':
        filtered.sort((a, b) => (b.name || '').localeCompare(a.name || '', 'es', { sensitivity: 'base' }));
        break;
      case 'nuevo':
      case 'newest':
        filtered.sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
        break;
      case 'antiguo':
      case 'oldest':
        filtered.sort((a, b) => new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime());
        break;
      case 'precio':
      case 'price':
        filtered.sort((a, b) => (a.price || 0) - (b.price || 0));
        break;
      case 'precio-desc':
      case 'price-desc':
        filtered.sort((a, b) => (b.price || 0) - (a.price || 0));
        break;
      default:
        // Default sort by newest
        filtered.sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
    }

    setFilteredProducts(filtered);
  };

  // Calculate pagination
  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE));
  const validCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (validCurrentPage - 1) * PRODUCTS_PER_PAGE;
  const paginatedProducts = filteredProducts.slice(startIndex, startIndex + PRODUCTS_PER_PAGE);
  const baseQuery = Object.fromEntries(searchParams?.entries() || []) as Record<string, string>;
  const getPageHref = (page: number) => {
    const params = new URLSearchParams(baseQuery);
    params.set('page', String(page));
    return `/public/products?${params.toString()}`;
  };

  // Calculate price range for filters
  const allPrices = products.map(p => p.price || 0).filter(p => p > 0);
  const globalMinPrice = allPrices.length > 0 ? Math.min(...allPrices) : 0;
  const globalMaxPrice = allPrices.length > 0 ? Math.max(...allPrices) : 100;

  // Get unique categories and materials for filters
  const availableCategories = categories.map(c => c.name);
  const availableMaterials = [...new Set(subcategories.map(s => s.name))]; // Remove duplicates

  // Generate page title based on filters
  const getPageTitle = () => {
    // Buscar la categoría seleccionada en la lista dinámica
    let title = '';
    if (categoryParam) {
      const category = categories.find(c => c.name.toLowerCase() === categoryParam.toLowerCase());
      if (category) {
        title = category.name.charAt(0).toUpperCase() + category.name.slice(1);
      }
    }
    // Buscar la subcategoría seleccionada en la lista dinámica
    if (materialParam) {
      const subcategory = subcategories.find(s => s.name.toLowerCase() === materialParam.toLowerCase());
      if (subcategory) {
        title = title ? `${title} - ${subcategory.name}` : subcategory.name;
      }
    }
    return title || 'Nuestra Colección';
  };

  const getPageDescription = () => {
    if (categoryParam) {
      const categoryName = categoryMapping[categoryParam.toLowerCase()];
      if (categoryName) {
        return `Explora nuestra colección completa de ${categoryName.toLowerCase()}`;
      }
    }
    return 'Recorre nuestra web, te vas a enamorar!';
  };

  if (loading) {
    return (
      <div className="bg-background">
        <div className="container pt-12 sm:pt-16 pb-8 sm:pb-12">
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background">
      <div className="container pt-12 sm:pt-16 pb-8 sm:pb-12">
        <div className="mb-8 flex flex-col gap-6">
          <div className="text-center">
            <h1 className="font-headline text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight" style={{ paddingTop: "80px", fontSize: "clamp(2rem, 2vw, 3.75rem)" }}>
              {getPageTitle()}
            </h1>
            <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground pb-4">
              {getPageDescription()}
            </p>
            {filteredProducts.length > 0 && (
              <p className="mt-2 text-sm text-muted-foreground mb-4">
                {filteredProducts.length} {filteredProducts.length === 1 ? 'producto encontrado' : 'productos encontrados'}
              </p>
            )}
          </div>
          <div className="flex flex-col gap-4">
            <ProductsControlsClient
              categories={availableCategories}
              materials={availableMaterials}
              currentCategory={categoryParam}
              currentMaterial={materialParam}
              currentMin={parseFloat(minPriceParam) || globalMinPrice}
              currentMax={parseFloat(maxPriceParam) || globalMaxPrice}
              globalMin={globalMinPrice}
              globalMax={globalMaxPrice}
              currentSort={sortParam}
            />
          </div>
        </div>
      </div>
      {/* Products Grid */}
      <div className="px-0 md:container">
        {paginatedProducts.length === 0 ? (
          <div className="text-center py-12 px-4">
            <h3 className="text-lg font-semibold mb-2">No se encontraron productos</h3>
            <p className="text-muted-foreground">
              Intenta ajustar los filtros o explora otras categorías
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-1 md:gap-6 bg-background mb-8 max-w-full overflow-hidden">
              {paginatedProducts.map((product, index) => {
                const slug = buildProductSlug({ id: product.id, name: product.name });
                const isSoldOut = typeof product.stock === 'number' ? product.stock <= 0 : false;
                return (
                  <div key={product.id} className="md:p-0">
                    <Link href={`/public/products/${slug}`} className="block">
                      <Card className="group overflow-hidden transition-shadow duration-300 border-none bg-background shadow-none rounded-none h-full flex flex-col">
                        <CardContent className="p-0 flex-grow">
                        <div className="aspect-[9/16] overflow-hidden relative h-full w-full">
                          {getValidImageUrl(product.cover_image) ? (
                            <>
                              {(() => {
                                // Determine hover image: prefer hover_image, fallback to first product_images
                                const hoverImageUrl = getValidImageUrl(product.hover_image) || 
                                  (product.product_images && product.product_images.length > 0 && getValidImageUrl(product.product_images[0]));
                                
                                // Only apply hover opacity transition if there's a hover image
                                const coverImageClass = hoverImageUrl 
                                  ? "w-full h-full object-cover transition-opacity duration-300 group-hover:opacity-0"
                                  : "w-full h-full object-cover";
                                
                                return (
                                  <>
                                    <Image
                                      src={getValidImageUrl(product.cover_image)!}
                                      alt={product.name || 'Producto'}
                                      width={453}
                                      height={807}
                                      className={coverImageClass}
                                      sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                                    />
                                    {hoverImageUrl && (
                                      <Image
                                        src={hoverImageUrl}
                                        alt={`${product.name} - vista alternativa`}
                                        width={453}
                                        height={807}
                                        className="w-full h-full object-cover absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                                        sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                                      />
                                    )}
                                  </>
                                );
                              })()}
                              {isSoldOut && (
                                <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
                                  <Image
                                    src="/SOLDOUT.png"
                                    alt="Agotado"
                                    width={320}
                                    height={320}
                                    className="object-contain"
                                  />
                                </div>
                              )}
                            </>
                          ) : (
                            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                              <span className="text-gray-400">Sin imagen</span>
                            </div>
                          )}
                        </div>
                      </CardContent>
                      <div className="py-3 sm:py-4 px-1.5 sm:px-2 bg-background">
                        <CardHeader className="p-0">
                          <CardTitle className="font-headline text-sm sm:text-xl tracking-normal text-left leading-snug line-clamp-2">
                            {product.name}
                          </CardTitle>
                        </CardHeader>
                        <CardFooter className="p-0 pt-1.5 sm:pt-2 justify-start">
                          <p className="text-sm sm:text-lg font-semibold">
                            ${(product.price || 0).toFixed(2)}
                          </p>
                        </CardFooter>
                      </div>
                    </Card>
                  </Link>
                  </div>
                );
              })}
            </div>
            {/* Pagination */}
            {totalPages > 1 && (
              <Pagination className="justify-center px-4 md:px-0 mb-6">
                <PaginationContent>
                  {/* Generate pagination items with arrows, compact range, and ellipsis */}
                  {(() => {
                    const paginationItems: JSX.Element[] = [];
                    const displayedPages = new Set<number>();
                    const previousPage = validCurrentPage > 1 ? validCurrentPage - 1 : null;
                    const nextPage = validCurrentPage < totalPages ? validCurrentPage + 1 : null;

                    const addPageNumber = (page: number | null) => {
                      if (!page || page < 1 || page > totalPages || displayedPages.has(page)) {
                        return;
                      }
                      displayedPages.add(page);
                      paginationItems.push(
                        <PaginationItem key={`page-${page}`}>
                          <PaginationLink
                            href={getPageHref(page)}
                            isActive={page === validCurrentPage}
                          >
                            {page}
                          </PaginationLink>
                        </PaginationItem>
                      );
                    };

                    paginationItems.push(
                      <PaginationItem key="prev-arrow">
                        <PaginationLink
                          href={previousPage ? getPageHref(previousPage) : '#'}
                          aria-label="Página anterior"
                          aria-disabled={!previousPage}
                          tabIndex={previousPage ? undefined : -1}
                          className={!previousPage ? 'pointer-events-none opacity-50' : undefined}
                        >
                          <ArrowLeftIcon className="h-4 w-4" />
                        </PaginationLink>
                      </PaginationItem>
                    );

                    addPageNumber(previousPage);
                    addPageNumber(validCurrentPage);
                    addPageNumber(nextPage);

                    const highestDisplayed = displayedPages.size
                      ? Math.max(...Array.from(displayedPages))
                      : 0;

                    const shouldShowEllipsis =
                      totalPages > 0 &&
                      !displayedPages.has(totalPages) &&
                      highestDisplayed < totalPages - 1;

                    if (shouldShowEllipsis) {
                      paginationItems.push(
                        <PaginationItem key="ellipsis">
                          <span className="px-3 py-2">...</span>
                        </PaginationItem>
                      );
                    }

                    if (!displayedPages.has(totalPages)) {
                      addPageNumber(totalPages);
                    }

                    paginationItems.push(
                      <PaginationItem key="next-arrow">
                        <PaginationLink
                          href={nextPage ? getPageHref(nextPage) : '#'}
                          aria-label="Página siguiente"
                          aria-disabled={!nextPage}
                          tabIndex={nextPage ? undefined : -1}
                          className={!nextPage ? 'pointer-events-none opacity-50' : undefined}
                        >
                          <ArrowRightIcon className="h-4 w-4" />
                        </PaginationLink>
                      </PaginationItem>
                    );

                    return paginationItems;
                  })()}
                </PaginationContent>
              </Pagination>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center min-h-screen"><Loader2 className="h-8 w-8 animate-spin" /></div>}>
      <ProductsContent />
    </Suspense>
  );
}