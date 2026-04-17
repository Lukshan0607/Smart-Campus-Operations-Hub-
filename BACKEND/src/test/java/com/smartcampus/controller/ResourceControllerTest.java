package com.smartcampus.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.context.bean.override.mockito.MockitoBean;

import com.smartcampus.dto.ResourceRequestDTO;
import com.smartcampus.dto.ResourceResponseDTO;
import com.smartcampus.entity.Resource.ResourceType;
import com.smartcampus.service.ResourceService;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(ResourceController.class)
@AutoConfigureMockMvc(addFilters = false)
class ResourceControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private ResourceService resourceService;

    @Test
    void create_returns201() throws Exception {
        when(resourceService.create(any(ResourceRequestDTO.class), eq(1L)))
            .thenReturn(ResourceResponseDTO.builder()
                .id(1L)
                .name("Lab 1")
                .type(ResourceType.LAB)
                .location("Building B, Room 101")
                .build());

        mockMvc.perform(post("/api/resources?createdBy=1")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {
                      "name": "Lab 1",
                      "type": "LAB",
                      "capacity": 30,
                      "location": "Building B, Room 101",
                      "totalQuantity": 1
                    }
                    """))
            .andExpect(status().isCreated());
    }
}

