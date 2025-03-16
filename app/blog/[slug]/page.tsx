import type { Metadata } from 'next'
import { getBlogPosts } from '@/components/mdx/utils'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import PostDate from '@/components/post-date'
import { CustomMDX } from '@/components/mdx/mdx'
import Newsletter from '@/components/newsletter'
import RelatedPosts from '@/components/related-posts-02'

export async function generateStaticParams() {
  const allBlogs = getBlogPosts();

  return allBlogs.map((post) => ({
    slug: post.slug,
  }))
}

export async function generateMetadata(
  props: {
    params: Promise<{ slug: string }>
  }
): Promise<Metadata | undefined> {
  const params = await props.params;
  const post = getBlogPosts().find((post) => post.slug === params.slug);

  if (!post) {
    return;
  }

  const { title, summary: description } = post.metadata;

  return {
    title,
    description,
  };
}

export default async function SinglePost(
  props: {
    params: Promise<{ slug: string }>
  }
) {
  const params = await props.params;
  const post = getBlogPosts().find((post) => post.slug === params.slug);

  if (!post) notFound();

  return (
    <>
      <section className="relative">
        {/* Background image */}
        {post.metadata.image &&
          <div className="absolute inset-0 h-128 pt-16 box-content">
            <Image className="absolute inset-0 w-full h-full object-cover opacity-25" src={post.metadata.image} width={1440} height={577} priority alt={post.metadata.title} />
            <div className="absolute inset-0 bg-linear-to-t from-white dark:from-gray-900" aria-hidden="true"></div>
          </div>
        }

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6">
          <div className="pt-32 pb-12 md:pt-40 md:pb-20">
            <div className="max-w-3xl mx-auto">

              <article>

                {/* Article header */}
                <header className="mb-8">
                  {/* Title and excerpt */}
                  <div className="text-center md:text-left">
                    <h1 className="h1 font-red-hat-display mb-4" data-aos="fade-down">{post.metadata.title}</h1>
                    <p className="text-xl text-gray-600 dark:text-gray-400" data-aos="fade-down" data-aos-delay="150">{post.metadata.summary}</p>
                  </div>
                  {/* Article meta */}
                  <div className="md:flex md:items-center md:justify-between mt-5">
                    {/* Author meta */}
                    {post.metadata.author && (
                      <div className="flex items-center justify-center" data-aos="fade-down" data-aos-delay="300">
                        {post.metadata.authorImg && (
                          <a href="#0">
                            <Image className="rounded-full shrink-0 mr-3" src={post.metadata.authorImg} width={32} height={32} alt={post.metadata.author} />
                          </a>
                        )}
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">By </span>
                          <a className="font-medium text-gray-800 dark:text-gray-300 hover:underline" href="#0">{post.metadata.author}</a>
                          <span className="text-gray-600 dark:text-gray-400"> · <PostDate dateString={post.metadata.publishedAt} /></span>
                        </div>
                      </div>
                    )}
                  </div>
                </header>
                <hr className="w-5 h-px pt-px bg-gray-400 dark:bg-gray-500 border-0 mb-8" data-aos="fade-down" data-aos-delay="450" />

                {/* Article content */}
                <div className="mb-8" data-aos="fade-up" data-aos-delay="450">
                  <article className="prose text-lg text-gray-600 dark:text-gray-400 max-w-none prose-lg prose-p:leading-normal prose-headings:text-gray-900 dark:prose-headings:text-gray-100 prose-a:text-orange-500 prose-a:no-underline hover:prose-a:underline prose-a:font-medium prose-strong:font-medium prose-strong:text-gray-900 dark:prose-strong:text-gray-100 prose-blockquote:italic prose-blockquote:pl-4 prose-blockquote:border-l-2 prose-blockquote:border-orange-500 dark:prose-blockquote:border-gray-400 prose-blockquote:font-normal prose-blockquote:text-inherit">
                    <CustomMDX source={post.content} />
                  </article>
                </div>

                {/* Article footer */}
                <footer>
                  <Newsletter />
                </footer>

              </article>

            </div>

          </div>
        </div>
      </section>
      <RelatedPosts />
    </>
  )
}