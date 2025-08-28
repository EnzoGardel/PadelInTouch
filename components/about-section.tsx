import { Card, CardContent } from "@/components/ui/card"
import { Icons } from "@/components/icons"

export function AboutSection() {
  const features = [
    {
      icon: Icons.Trophy,
      title: "Canchas de calidad profesional",
      description:
        "Superficie de césped sintético de última generación, tanto indoor como outdoor, con iluminación LED profesional.",
    },
    {
      icon: Icons.Users,
      title: "Escuela de pádel",
      description:
        "Entrenamiento funcional y clases para todos los niveles con instructores certificados y metodología moderna.",
    },
    {
      icon: Icons.Target,
      title: "Comunidad competitiva",
      description:
        "Torneos regulares, ligas internas y eventos que fomentan el crecimiento deportivo y social de nuestros socios.",
    },
    {
      icon: Icons.Star,
      title: "Historia de campeones",
      description:
        "Orgullo local: en nuestros inicios entrenó aquí el actual Nº1 del pádel mundial, formando parte de nuestra rica historia deportiva.",
    },
  ]

  return (
    <section id="sobre-nosotros" className="py-20 ">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 bg-white/20 p rounded-3xl p-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Sobre nosotros</h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Más que un club, somos una comunidad apasionada por el pádel que ha formado campeones y sigue creciendo cada
            día.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {features.map((feature, index) => (
            <Card key={index} className="text-center hover:shadow-lg transition-shadow duration-300 bg-white/90">
              <CardContent className="p-6">
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                  <feature.icon />
                </div>
                <h3 className="text-lg font-semibold mb-3">{feature.title}</h3>
                <p className=" text-sm leading-relaxed">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Champion highlight */}
        <div className=" bg-white/90 hover:shadow-lg transition-shadow duration-300 rounded-2xl p-8 md:p-12 text-center border border-primary/10">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-center mb-6">
              <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center">
                <Icons.Trophy />
              </div>
            </div>
            <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-4">Cuna del campeón mundial</h3>
            <p className="text-lg text-muted-foreground leading-relaxed">
              En Lavalle Padel Club no solo ofrecemos las mejores instalaciones, sino que también tenemos el orgullo de
              haber sido el lugar donde dio sus primeros pasos quien hoy es el{" "}
              <strong className="text-primary">Nº1 del pádel mundial</strong>. Esta historia nos motiva a seguir
              formando nuevos talentos y a mantener el más alto nivel de excelencia en cada detalle.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}