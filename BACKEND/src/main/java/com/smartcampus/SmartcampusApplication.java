package com.smartcampus;

import java.io.IOException;
import java.io.InputStream;
import java.net.InetAddress;
import java.net.InetSocketAddress;
import java.net.Socket;
import java.util.Properties;

import javax.sql.DataSource;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.condition.ConditionalOnBean;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.smartcampus.entity.AuthProvider;
import com.smartcampus.entity.Role;
import com.smartcampus.entity.User;
import com.smartcampus.repository.UserRepository;

@SpringBootApplication
public class SmartcampusApplication {

	private static final Logger log = LoggerFactory.getLogger(SmartcampusApplication.class);

	public static void main(String[] args) {
		int port = resolveServerPort(args);
		assertListenPortFree(port);
		SpringApplication.run(SmartcampusApplication.class, args);
		log.info("✅ Smart Campus Facilities & Assets REST API server started successfully.");
	}

	private static int resolveServerPort(String[] args) {
		Properties props = new Properties();
		try (InputStream in = SmartcampusApplication.class.getClassLoader().getResourceAsStream("application.properties")) {
			if (in != null) {
				props.load(in);
			}
		} catch (IOException ignored) {
			// fall through to default
		}
		int port = Integer.parseInt(props.getProperty("server.port", "8083").trim());
		for (String arg : args) {
			if (arg.startsWith("--server.port=")) {
				return Integer.parseInt(arg.substring("--server.port=".length()).trim());
			}
		}
		String envPort = System.getenv("SERVER_PORT");
		if (envPort != null && !envPort.isBlank()) {
			return Integer.parseInt(envPort.trim());
		}
		String sysPort = System.getProperty("server.port");
		if (sysPort != null && !sysPort.isBlank()) {
			return Integer.parseInt(sysPort.trim());
		}
		return port;
	}

	/**
	 * Fails fast with a clear message instead of a long Spring stack trace when another
	 * {@code spring-boot:run} (or VS Code + Cursor) is still bound to the same port.
	 */
	private static void assertListenPortFree(int port) {
		try (Socket socket = new Socket()) {
			socket.connect(new InetSocketAddress(InetAddress.getLoopbackAddress(), port), 500);
			System.err.println();
			System.err.println("Port " + port + " is already in use — another Smart Campus backend is still running.");
			System.err.println("Stop it: focus the other terminal and press Ctrl+C, or in PowerShell run:");
			System.err.println("  Get-NetTCPConnection -LocalPort " + port + " | Select-Object -ExpandProperty OwningProcess -Unique | ForEach-Object { Stop-Process -Id $_ -Force }");
			System.err.println();
			System.exit(1);
		} catch (IOException ignored) {
			// connection refused / timeout => nothing accepting on that port
		}
	}

	@Bean
	@ConditionalOnBean(DataSource.class)
	CommandLineRunner dbHealthCheck(DataSource dataSource) {
		return args -> {
			try (var connection = dataSource.getConnection()) {
				if (!connection.isClosed()) {
					log.info("✅ Successfully connected to the database: {}", connection.getMetaData().getURL());
				} else {
					log.warn("⚠ Database connection obtained but appears to be closed.");
				}
			} catch (Exception ex) {
				log.error("❌ Failed to connect to the database on startup.", ex);
			}
		};
	}

	@Bean
	CommandLineRunner seedDefaultUsers(UserRepository userRepository, PasswordEncoder passwordEncoder) {
		return args -> {
			createDefaultUserIfMissing(userRepository, passwordEncoder,
				"ADM0001", "Admin User", "admin@smartcampus.com", "0770000001", "admin123", Role.ADMIN);

			createDefaultUserIfMissing(userRepository, passwordEncoder,
				"TEC0001", "Technician One", "technician@smartcampus.com", "0770000002", "tech123", Role.TECHNICIAN);

			for (int i = 2; i <= 12; i++) {
				createDefaultUserIfMissing(
						userRepository,
						passwordEncoder,
						String.format("TEC%04d", i),
						"Technician " + i,
						"technician" + i + "@smartcampus.com",
						String.format("0770000%03d", i),
						"tech123",
						Role.TECHNICIAN
				);
			}

			createDefaultUserIfMissing(userRepository, passwordEncoder,
				"STU0001", "Student User", "student@smartcampus.com", "0770000003", "student123", Role.USER);

			createDefaultUserIfMissing(userRepository, passwordEncoder,
				"LEC0001", "Lecturer User", "lecturer@smartcampus.com", "0770000004", "lecturer123", Role.USER);
		};
	}

	private static void createDefaultUserIfMissing(UserRepository userRepository,
			PasswordEncoder passwordEncoder,
			String userId,
			String name,
			String email,
			String phone,
			String rawPassword,
			Role role) {
		if (userRepository.existsByEmail(email)) {
			return;
		}

		User user = User.builder()
				.userId(userId)
				.name(name)
				.email(email)
				.phone(phone)
				.password(passwordEncoder.encode(rawPassword))
				.role(role)
				.status("Active")
				.provider(AuthProvider.LOCAL)
				.build();

		userRepository.save(user);
	}
}
