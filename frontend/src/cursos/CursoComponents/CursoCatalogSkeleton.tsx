const SkeletonBlock = ({ className = "" }: { className?: string }) => (
  <div
    aria-hidden="true"
    className={`course-skeleton__block ${className}`}
  />
);

export default function CursoCatalogSkeleton() {
  return (
    <section
      className="course-skeleton"
      aria-busy="true"
      aria-label="Cargando catálogo de cursos"
    >
      <div className="course-skeleton__banner">
        <div className="course-skeleton__banner-content">
          <SkeletonBlock className="course-skeleton__eyebrow" />
          <SkeletonBlock className="course-skeleton__title" />
          <SkeletonBlock className="course-skeleton__description" />
          <SkeletonBlock className="course-skeleton__button" />
        </div>
        <SkeletonBlock className="course-skeleton__banner-image" />
      </div>

      <div className="course-skeleton__catalog">
        <SkeletonBlock className="course-skeleton__section-title" />

        <div className="course-skeleton__filters">
          <SkeletonBlock className="course-skeleton__filter" />
          <SkeletonBlock className="course-skeleton__filter" />
          <SkeletonBlock className="course-skeleton__filter" />
        </div>

        <div className="course-skeleton__grid">
          {Array.from({ length: 8 }, (_, index) => (
            <article className="course-skeleton__card" key={index}>
              <SkeletonBlock className="course-skeleton__card-image" />
              <div className="course-skeleton__card-content">
                <SkeletonBlock className="course-skeleton__tag" />
                <SkeletonBlock className="course-skeleton__card-title" />
                <SkeletonBlock className="course-skeleton__line" />
                <SkeletonBlock className="course-skeleton__line course-skeleton__line--short" />
                <SkeletonBlock className="course-skeleton__price" />
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}