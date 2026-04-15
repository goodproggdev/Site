import { useTranslation } from 'react-i18next';

const Testimonial = () => {
  const { t } = useTranslation();

  return (
    <section id="testimonials" className="section-y scroll-mt-24 bg-white dark:bg-gray-900">
      <div className="mx-auto max-w-screen-xl container-padding">
        <div className="max-w-3xl mx-auto text-center">
          {/* Quote Icon */}
          <svg
            className="h-10 w-10 mx-auto mb-6 text-gray-300 dark:text-gray-600"
            fill="currentColor"
            viewBox="0 0 24 27"
          >
            <path d="M14.017 18L14.017 10.609C14.017 4.905 17.748 1.039 23 0L23.995 2.151C21.563 3.068 20 5.789 20 8H24V18H14.017ZM0 18V10.609C0 4.905 3.748 1.038 9 0L9.996 2.151C7.563 3.068 6 5.789 6 8H9.983L9.983 18L0 18Z" />
          </svg>

          {/* Quote */}
          <blockquote className="mb-8">
            <p className="text-xl md:text-2xl lg:text-3xl font-medium text-gray-900 dark:text-white leading-relaxed">
              "{t('components.testimonials.quote')}"
            </p>
          </blockquote>

          {/* Author */}
          <figcaption className="flex items-center justify-center gap-4">
            <img
              className="w-12 h-12 rounded-full border-2 border-gray-200 dark:border-gray-700"
              src="/logo-nordev.png"
              alt="Marco G."
            />
            <div className="text-left">
              <div className="font-semibold text-gray-900 dark:text-white">
                Marco G.
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Senior Software Engineer
              </div>
            </div>
          </figcaption>
        </div>
      </div>
    </section>
  );
};

export default Testimonial;
