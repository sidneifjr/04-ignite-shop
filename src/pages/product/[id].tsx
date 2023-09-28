import { stripe } from '@/lib/stripe'
import {
  ImageContainer,
  ProductContainer,
  ProductDetails,
} from '@/styles/pages/product'
import axios from 'axios'
import { GetStaticPaths, GetStaticProps } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import { useState } from 'react'

import Stripe from 'stripe'

interface ProductProps {
  product: {
    id: string
    name: string
    imageUrl: string
    price: string
    description: string
    defaultPriceId: string
  }
}

export default function Product({ product }: ProductProps) {
  const [isCreatingCheckoutSession, setIsCreatingCheckoutSession] =
    useState(false)

  async function handleBuyProduct() {
    try {
      setIsCreatingCheckoutSession(true)

      const response = await axios.post('/api/checkout', {
        priceId: product?.defaultPriceId,
      })

      const { checkoutUrl } = response.data
      window.location.href = checkoutUrl
    } catch (err) {
      // Conectar com uma ferramenta de observabilidade (Datadog / Sentry).

      setIsCreatingCheckoutSession(false)

      console.error('Falha ao redirecionar ao checkout!')
    }
  }

  return (
    <>
      <Head>
        <title> {product?.name} | Ignite Shop</title>
      </Head>

      <ProductContainer>
        <ImageContainer>
          <Image src={product?.imageUrl} width={520} height={480} alt="" />
        </ImageContainer>

        <ProductDetails>
          <h1>{product?.name}</h1>
          <span>{product?.price}</span>

          <p>{product?.description}</p>

          <button
            disabled={isCreatingCheckoutSession}
            onClick={handleBuyProduct}
          >
            {isCreatingCheckoutSession ? (
              <Image src="/loader.svg" alt="loader" width="22" height="22" />
            ) : (
              'Comprar agora'
            )}
          </button>
        </ProductDetails>
      </ProductContainer>
    </>
  )
}

export const getStaticPaths: GetStaticPaths = async () => {
  return {
    paths: [{ params: { id: 'prod_ObQs7vu22lgsww' } }],
    fallback: true,
  }
}

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const productId = String(params?.id)

  const product = await stripe.products.retrieve(productId, {
    expand: ['default_price'],
  })

  const price = product?.default_price as Stripe.Price
  const priceUnit = price.unit_amount as number

  return {
    props: {
      product: {
        id: product?.id,
        name: product?.name,
        imageUrl: product?.images[0],
        price: new Intl.NumberFormat('pt-br', {
          style: 'currency',
          currency: 'BRL',
        }).format(priceUnit / 100),
        description: product?.description,
        defaultPriceId: price.id,
      },
    },
    revalidate: 60 * 60 * 1, // 1 hour
  }
}
