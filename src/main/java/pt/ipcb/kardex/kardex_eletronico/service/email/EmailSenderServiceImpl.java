package pt.ipcb.kardex.kardex_eletronico.service.email;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import pt.ipcb.kardex.kardex_eletronico.exception.FailedEmailMessageException;
import pt.ipcb.kardex.kardex_eletronico.model.entity.Utilizador;

@Service
@RequiredArgsConstructor
public class EmailSenderServiceImpl implements EmailSenderService {

    private final JavaMailSender mailSender;

    @Value("${app.mail.from}")
    private String from;

    public void sendSimple(String to, String subject, String body) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(from);
        message.setTo(to);
        message.setSubject(subject);
        message.setText(body);
        mailSender.send(message);
    }

    public void sendHtml(String to, String subject, String html) throws MessagingException {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
        helper.setFrom(from);
        helper.setTo(to);
        helper.setSubject(subject);
        helper.setText(html, true);
        mailSender.send(message);
    }

    @Override
    public void sendPasswordResetEmail(Utilizador user, String token) {
        var to = user.getEmail();
        var subject = "Pedido de Reset de Password - Kardex Eletrónico";
        var body = String.format("""
                <p>Olá %s,</p>
                <p>Recebemos um pedido para resetar a sua password. Se não foi você, por favor ignore este email.</p>
                <p>Para resetar a sua password, clique no link abaixo:</p>
                <p><a href="http://localhost:8080/pages/login/recuperarPassword.html?u=%d&t=%s">Resetar Password</a></p>
                <p>Obrigado,<br>Kardex Eletrónico</p>
                """, user.getNome(), user.getId(), token);
        try {
            sendHtml(to, subject, body);
        } catch (MessagingException e) {
            throw new FailedEmailMessageException(to, "Reset de Password");
        }
    }
}
