import './styles/howWork.css';  
  
function HowWork() {

  const howItWorks = [
    {
      step: "1",
      title: "Registrati",
      description: "Crea il tuo account cittadino gratuito",
    },
    {
      step: "2",
      title: "Individua il Problema",
      description: "Usa la mappa per localizzare il problema urbano",
    },
    {
      step: "3",
      title: "Crea la Segnalazione",
      description: "Compila il form con i dettagli e le foto",
    },
    {
      step: "4",
      title: "Monitoraggio",
      description: "Ricevi aggiornamenti sullo stato della tua segnalazione",
    },
  ];

    return (
        <>
        {/* How It Works Section */}
            <section className="how-it-works-section">
                <Container>
                <h2 className="section-title">Come Funziona</h2>
                <Row className="g-4">
                    {howItWorks.map((item, index) => (
                    <Col key={index} md={6} lg={3}>
                        <div className="step-card">
                        <div className="step-number">{item.step}</div>
                        <h3 className="step-title">{item.title}</h3>
                        <p className="step-description">{item.description}</p>
                        </div>
                    </Col>
                    ))}
                </Row>
                </Container>
            </section>
        </>
    )

}

export default HowWork;