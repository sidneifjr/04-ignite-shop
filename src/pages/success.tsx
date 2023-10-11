import { stripe } from '@/lib/stripe'
import { ImageContainer, SuccessContainer } from '@/styles/pages/success'
import { GetServerSideProps } from 'next'
import Link from 'next/link'
import Stripe from 'stripe'

import { motion } from 'framer-motion'
import Head from 'next/head'
import Image from 'next/image'

interface SuccessProps {
  customerName: string
  product: {
    name: string
    imageUrl: string
  }
}

export default function Success({ customerName, product }: SuccessProps) {
  return (
    <>
      <Head>
        <title> Compra efetuada | Ignite Shop</title>
        <meta name="robots" content="noindex" />
        {/* Evita que os crawlers indexem essa tela. */}
      </Head>

      <SuccessContainer>
        <motion.div
          initial={{ y: '25%', opacity: 0 }}
          animate={{ y: '0%', opacity: 1 }}
          transition={{ duration: 0.75, ease: [0.33, 1, 0.68, 1] }}
          style={{ margin: '0 auto', all: 'inherit' }}
          exit={{ y: '-25%', opacity: 0 }}
        >
          <ImageContainer>
            <Image src={product.imageUrl} alt="" width={120} height={110} />
          </ImageContainer>

          <h1>Compra efetuada!</h1>

          <p>
            Uhuul <strong>{customerName}</strong>, seu pedido{' '}
            <strong>{product.name}</strong> já está a caminho da sua casa.
          </p>

          <Link href="/">Voltar ao catálogo </Link>
        </motion.div>
      </SuccessContainer>
    </>
  )
}

export const getServerSideProps: GetServerSideProps = async ({ query }) => {
  if (!query.session_id) {
    return {
      redirect: {
        destination: '/',
        permanent: false, // o redirect nao e permamente, ocorrendo apenas quando nao houver o session_id.
      },
    }
  }

  const sessionId = String(query.session_id)

  const session = await stripe.checkout.sessions.retrieve(sessionId, {
    expand: ['line_items', 'line_items.data.price.product'],
  })

  // @ts-ignore
  const customerName = session.customer_details.name

  // @ts-ignore
  const product = session.line_items.data[0].price.product as Stripe.Product

  return {
    props: {
      customerName,
      product: {
        name: product.name,
        imageUrl: product.images[0],
      },
    },
  }
}
