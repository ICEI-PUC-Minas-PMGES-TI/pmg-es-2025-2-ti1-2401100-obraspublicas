document.addEventListener('DOMContentLoaded', () => {

    // Função para extrair a contagem do texto do botão
    const extractCount = (btn) => {
        // Pega o último elemento dentro do botão, que deve ser o texto (a contagem)
        const countText = btn.textContent.trim().split(' ').pop();
        return parseInt(countText) || 0;
    };

    // Função para atualizar a contagem no texto do botão
    const updateCount = (btn, newCount) => {
        // Encontra o ícone (primeiro filho)
        const icon = btn.querySelector('i');
        
        // Atualiza todo o conteúdo do botão com o ícone e a nova contagem
        btn.innerHTML = `${icon.outerHTML} ${newCount}`;
    };


    // 1. Funcionalidade de Like/Dislike (CORREÇÃO DE FUNCIONAMENTO)
    const likeDislikeControls = document.querySelectorAll('.like-dislike-controls');

    likeDislikeControls.forEach(controls => {
        const likeBtn = controls.querySelector('.like-btn');
        const dislikeBtn = controls.querySelector('.dislike-btn');

        // Salvamos a contagem inicial no atributo de dados, por segurança.
        const initialLikeCount = extractCount(likeBtn);
        const initialDislikeCount = extractCount(dislikeBtn);
        likeBtn.setAttribute('data-count', initialLikeCount);
        dislikeBtn.setAttribute('data-count', initialDislikeCount);


        const handleInteraction = (clickedBtn, otherBtn) => {
            let clickedCount = extractCount(clickedBtn);
            let otherCount = extractCount(otherBtn);

            // Se o botão clicado JÁ estiver ativo (o usuário está DESMARCANDO)
            if (clickedBtn.classList.contains('active')) {
                clickedBtn.classList.remove('active');
                updateCount(clickedBtn, clickedCount - 1);
            } 
            // Se o botão clicado NÃO estiver ativo (o usuário está MARCANDO)
            else {
                clickedBtn.classList.add('active');
                updateCount(clickedBtn, clickedCount + 1);
                
                // Verifica e desativa o botão OPOSTO, ajustando a contagem
                if (otherBtn.classList.contains('active')) {
                    otherBtn.classList.remove('active');
                    updateCount(otherBtn, otherCount - 1);
                }
            }
            
            console.log(`Voto simulado registrado! Feedback ID: ${controls.closest('.feedback-card-detail').dataset.feedbackId}`);
        };

        if (likeBtn && dislikeBtn) {
            // Adiciona os event listeners
            likeBtn.addEventListener('click', () => handleInteraction(likeBtn, dislikeBtn));
            dislikeBtn.addEventListener('click', () => handleInteraction(dislikeBtn, likeBtn));
        }
    });

    // 2. Mockup para o Link do Novo Feedback (MANTIDO)
    const novoFeedbackLink = document.querySelector('.btn-primary');
    if (novoFeedbackLink) {
        novoFeedbackLink.addEventListener('click', () => {
             console.log(`Redirecionando para: ${novoFeedbackLink.getAttribute('href')}`);
        });
    }

});