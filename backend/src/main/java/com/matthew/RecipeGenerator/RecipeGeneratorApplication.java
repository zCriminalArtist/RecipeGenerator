package com.matthew.RecipeGenerator;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class RecipeGeneratorApplication {

	public static void main(String[] args) {
		SpringApplication.run(RecipeGeneratorApplication.class, args);
	}

}
