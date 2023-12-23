'use client';

import { Fragment, useEffect, useRef, useState } from 'react';

import {
  Center,
  Grid,
  Loader,
  ScrollArea,
  SimpleGrid,
  Stack,
  Transition,
} from '@mantine/core';
import { useIntersection } from '@mantine/hooks';

import {
  ErrorAlert,
  ProductCard,
  ProductCardPlaceholder,
  ProductFilter,
  ProductSearch,
} from '@/components';
import type { Locale } from '@/types';
import {
  PRODUCT_MAX_PRICE,
  PRODUCTS_PER_PAGE,
  PUBLIC_LAYOUT_CONTENT_BLOCK_PADDING,
  PUBLIC_LAYOUT_CONTENT_MAX_SIZE,
  randomId,
} from '@/utils';

import { useProducts } from '../hooks';

type Props = {
  lang: Locale;
  search?: string;
  filter?: string;
};

export function Products({ lang, search, filter }: Props) {
  const [limit, setLimit] = useState(PRODUCTS_PER_PAGE);
  const containerRef = useRef<HTMLDivElement>(null);

  const { ref: loaderRef, entry } = useIntersection({
    root: containerRef.current,
    threshold: 1,
  });
  const { data, isLoading, error, total } = useProducts({
    lang,
    limit,
    search,
    filter: +(filter ?? PRODUCT_MAX_PRICE),
  });

  const inView = entry?.isIntersecting;
  const inLoaderMounted = total > limit;
  const isInfiniteScroll = total - limit >= PRODUCTS_PER_PAGE;

  useEffect(() => {
    if (inView) {
      setLimit(preLimit =>
        isInfiniteScroll ? preLimit + PRODUCTS_PER_PAGE : total,
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView]);

  const notFoundMessage =
    lang === 'en' ? 'Does`t exist item' : 'گزینه ای وجود ندارد';

  const content = data?.map(item => {
    const id = randomId();
    return <ProductCard key={id} {...item} />;
  });

  const placeholders = Array.from(
    { length: PRODUCTS_PER_PAGE },
    (_v, i) => i,
  ).map(() => {
    const id = randomId();
    return <ProductCardPlaceholder key={id} />;
  });

  return (
    <ScrollArea
      ref={containerRef}
      styles={{
        root: {
          height: `calc(${PUBLIC_LAYOUT_CONTENT_MAX_SIZE} - calc(${PUBLIC_LAYOUT_CONTENT_BLOCK_PADDING} * 2))`,
        },
      }}
    >
      <Stack gap='xs'>
        <Grid
          grow
          justify='space-between'
          align='center'
          styles={{
            inner: {
              marginBlock: 'unset',
            },
          }}
        >
          <Grid.Col span={{ base: 12, sm: 'auto', md: 4 }} order={{ sm: 2 }}>
            <ProductFilter />
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 'auto', md: 8 }} order={{ sm: 1 }}>
            <ProductSearch />
          </Grid.Col>
        </Grid>

        <Fragment>
          {error ? (
            <ErrorAlert message={error.message} />
          ) : !isLoading && Number(data?.length) === 0 ? (
            <ErrorAlert message={notFoundMessage} />
          ) : (
            <SimpleGrid cols={{ xs: 2, sm: 3, lg: 4 }} spacing='xs'>
              {content}
              {isLoading ? placeholders : null}
            </SimpleGrid>
          )}
        </Fragment>

        <Transition
          mounted={inLoaderMounted}
          transition='slide-up'
          duration={500}
          exitDuration={500}
        >
          {transitionStyle => (
            <Center py='xs' style={transitionStyle}>
              <Loader ref={loaderRef} size={24} />
            </Center>
          )}
        </Transition>
      </Stack>
    </ScrollArea>
  );
}
