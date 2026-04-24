package com.example.petemojimixer.controller;

import com.example.petemojimixer.model.Composition;
import com.example.petemojimixer.repository.CompositionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/compositions")
@CrossOrigin(origins = "http://localhost:5173")
public class CompositionController {

    @Autowired
    private CompositionRepository repository;

    @GetMapping
    public List<Composition> getAll() {
        return repository.findAll();
    }

    @PostMapping
    public Composition save(@RequestBody Composition composition) {
        return repository.save(composition);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        repository.deleteById(id);
    }
}
