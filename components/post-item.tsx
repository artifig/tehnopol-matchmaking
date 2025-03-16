import Link from 'next/link'
import Image from 'next/image'
import PostDate from '@/components/post-date'

export default function PostItem({ ...props }) {
  return (
    <article className="flex flex-col h-full">
      <header>
        {props.metadata.image &&
          <Link className="block mb-4" href={`/blog/${props.slug}`}>
            <figure className="relative h-0 pb-9/16">
              <Image className="absolute inset-0 w-full h-full object-cover" src={props.metadata.image} width={352} height={198} alt={props.metadata.title} />
            </figure>
          </Link>
        }
        <Link className="hover:underline" href={`/blog/${props.slug}`}>
          <h3 className="h4 font-red-hat-display mb-2">{props.metadata.title}</h3>
        </Link>
      </header>
      <p className="text-gray-600 dark:text-gray-400 grow">{props.metadata.summary}</p>
      <footer className="flex items-center mt-4">
        <a href="#0">
          <Image className="rounded-full shrink-0 mr-3" src={props.metadata.authorImg} width={32} height={32} alt={props.metadata.author} />
        </a>
        <div className="text-sm text-gray-500">
          By <a className="font-medium text-gray-800 dark:text-gray-400 hover:underline" href="#0">{props.metadata.author}</a> · <span className="text-gray-500"><PostDate dateString={props.metadata.publishedAt} /></span>
        </div>
      </footer>
    </article>
  )
}
