"use client";

import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
} from "@/components/ui/pagination";
import { useState, useEffect } from "react";
import type { SVGProps } from "react";
import { productApi } from '@/lib/api';
import type { Product } from '@/types/database';
import { buildProductSlug } from '@/lib/utils/productSlug';

const PRODUCTS_PER_PAGE = 8;

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

export default function AllProducts() {
  const [currentPage, setCurrentPage] = useState(1);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        const response = await productApi.products.getAll();
        
        if (response.error) {
          console.error('Error loading products:', response.error);
          setError('Error al cargar los productos');
          return;
        }

        // Filter active products only
        const activeProducts = (response.data || []).filter(product => product.is_active);
        setProducts(activeProducts);
        setError(null);
      } catch (err) {
        console.error('Error loading products:', err);
        setError('Error al cargar los productos');
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  const totalPages = Math.max(1, Math.ceil(products.length / PRODUCTS_PER_PAGE));
  const validCurrentPage = Math.min(Math.max(currentPage, 1), totalPages);

  const paginatedProducts = products.slice(
    (validCurrentPage - 1) * PRODUCTS_PER_PAGE,
    validCurrentPage * PRODUCTS_PER_PAGE
  );

  const handlePageChange = (page: number) => {
    const nextPage = Math.min(Math.max(page, 1), totalPages);
    setCurrentPage(nextPage);
    const section = document.getElementById('all-products-section');
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(price);
  };

  const getImageUrl = (imageUrl: string | null) => {
    if (!imageUrl) return "https://picsum.photos/900/1600?v=1";
    
    // If it's already a full URL, return as is
    if (imageUrl.startsWith('http')) return imageUrl;
    
    // If it's a relative path, you might need to prefix with your storage URL
    // For now, return the URL as is
    return imageUrl;
  };

  if (loading) {
    return (
      <div id="all-products-section" className="bg-background py-10 sm:py-16">
        <div className="container">
          <div className="text-center mb-8 sm:mb-12 px-2">
            <h2 className="font-headline text-2xl sm:text-4xl font-bold tracking-tight">
              Nuestra Colección
            </h2>
            <p className="mt-3 sm:mt-4 max-w-2xl mx-auto text-sm sm:text-lg text-muted-foreground px-1">
              Recorre nuestra web, te vas a enamorar!
            </p>
          </div>
          <div className="text-center">
            <p className="text-lg text-muted-foreground">Cargando productos...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div id="all-products-section" className="bg-background py-10 sm:py-16">
        <div className="container">
          <div className="text-center mb-8 sm:mb-12 px-2">
            <h2 className="font-headline text-2xl sm:text-4xl font-bold tracking-tight">
              Nuestra Colección
            </h2>
            <p className="mt-3 sm:mt-4 max-w-2xl mx-auto text-sm sm:text-lg text-muted-foreground px-1">
              Recorre nuestra web, te vas a enamorar!
            </p>
          </div>
          <div className="text-center">
            <p className="text-lg text-red-500">{error}</p>
            <p className="text-sm text-muted-foreground mt-2">
              Por favor, intenta recargar la página.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div id="all-products-section" className="bg-background py-10 sm:py-16">
        <div className="container">
          <div className="text-center mb-8 sm:mb-12 px-2">
            <h2 className="font-headline text-2xl sm:text-4xl font-bold tracking-tight">
              Nuestra Colección
            </h2>
            <p className="mt-3 sm:mt-4 max-w-2xl mx-auto text-sm sm:text-lg text-muted-foreground px-1">
              Recorre nuestra web, te vas a enamorar!
            </p>
          </div>
          <div className="text-center">
            <p className="text-lg text-muted-foreground">No hay productos disponibles en este momento.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div id="all-products-section" className="bg-background py-10 sm:py-16">
      <div className="container">
        <div className="text-center mb-8 sm:mb-12 px-2">
          <h2 className="font-headline text-2xl sm:text-4xl font-bold tracking-tight">
            Nuestra Colección
          </h2>
          <p className="mt-3 sm:mt-4 max-w-2xl mx-auto text-sm sm:text-lg text-muted-foreground px-1">
            Recorre nuestra web, te vas a enamorar!
          </p>
        </div>
      </div>
      
      {/* Grid without container for mobile full width */}
      <div className="px-0 md:container md:mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-0 md:gap-6">
          {paginatedProducts.map((product, index) => {
            const slug = buildProductSlug({ id: product.id, name: product.name });
            const isSoldOut = typeof product.stock === "number" ? product.stock <= 0 : false;
            
            // Calculate padding based on position in grid for mobile
            const isLeftColumn = index % 2 === 0; // For mobile 2-column layout
            const paddingClasses = `md:p-0 ${isLeftColumn ? 'pr-1' : 'pl-1'}`; // Only apply padding on mobile
            
            return (
              <div key={product.id} className={paddingClasses}>
                <Link href={`/public/products/${slug}`} className="block">
                  <Card className="group overflow-hidden transition-shadow duration-300 border-none bg-background shadow-none rounded-none h-full flex flex-col">
                  <CardContent className="p-0 flex-grow">
                    <div className="aspect-[9/16] overflow-hidden relative h-full">
                      <Image
                        src={getImageUrl(product.cover_image)}
                        alt={product.name}
                        width={900}
                        height={1600}
                        className="w-full h-full object-cover transition-opacity duration-300 group-hover:opacity-0"
                      />
                      <Image
                        src={getImageUrl(product.hover_image || product.cover_image)}
                        alt={`${product.name} (hover)`}
                        width={900}
                        height={1600}
                        className="w-full h-full object-cover absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                      />
                      {isSoldOut && (
                        <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
                          <Image
                            src="/SOLDOUT.png"
                            alt="Agotado"
                            width={320}
                            height={320}
                            className="object-contain"
                            priority={false}
                          />
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
                      <p className="text-sm sm:text-lg font-semibold">{formatPrice(product.price)}</p>
                    </CardFooter>
                  </div>
                </Card>
              </Link>
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Pagination with container */}
      <div className="container">
        <div className="mt-12 sm:mt-16">
          <Pagination>
            <PaginationContent>
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
                        href="#"
                        isActive={page === validCurrentPage}
                        onClick={(e) => {
                          e.preventDefault();
                          handlePageChange(page);
                        }}
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  );
                };

                paginationItems.push(
                  <PaginationItem key="prev-arrow">
                    <PaginationLink
                      href="#"
                      aria-label="Página anterior"
                      aria-disabled={!previousPage}
                      tabIndex={previousPage ? undefined : -1}
                      className={!previousPage ? 'pointer-events-none opacity-50' : undefined}
                      onClick={(e) => {
                        e.preventDefault();
                        if (previousPage) {
                          handlePageChange(previousPage);
                        }
                      }}
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
                      href="#"
                      aria-label="Página siguiente"
                      aria-disabled={!nextPage}
                      tabIndex={nextPage ? undefined : -1}
                      className={!nextPage ? 'pointer-events-none opacity-50' : undefined}
                      onClick={(e) => {
                        e.preventDefault();
                        if (nextPage) {
                          handlePageChange(nextPage);
                        }
                      }}
                    >
                      <ArrowRightIcon className="h-4 w-4" />
                    </PaginationLink>
                  </PaginationItem>
                );

                return paginationItems;
              })()}
            </PaginationContent>
          </Pagination>
        </div>
      </div>
    </div>
  );
}
