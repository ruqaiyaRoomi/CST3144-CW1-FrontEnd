let afterSchool = new Vue({
  el: "#app",
  data: {
    lessons: [], // Array for lessons
    cart: [], // Cart
    key: "", // sorting key
    order: "", // sort
    showCheckout: true,
    showbill: false,
    orderInformation: {
      nameInput: "",
      phoneNumber: "",
      email: "",
    },
    searchInput: "",
  },

  created: function () {
    // Fetch all lessons from backend
    fetch("https://cst3145-cw1-backend.onrender.com/Afterschool/lesson").then(
      function (response) {
        response.json().then(function (json) {
          afterSchool.lessons = json.map((lesson) => ({
            ...lesson,
            intialSpaces: lesson.spaces,
          }));
        });
      }
    );
  },

  methods: {
    // Add lesson to cart if space is available
    addToCart: function (lesson) {
      if (lesson.spaces > 0) {
        this.cart.push(lesson);
        lesson.spaces--;
      }
    },
    // remove lesson from cart and restore space
    removeFromCart: function (lesson) {
      const index = this.cart.indexOf(lesson);
      if (index !== -1) {
        this.cart.splice(index, 1);
        lesson.spaces++;
      }
    },

    // checks if lesson is full
    isFull: function (lesson) {
      return lesson.spaces === 0;
    },

    // Toggle checkout
    showCart: function () {
      if (!this.showCheckout && this.cart.length === 0) return;

      this.showCheckout = !this.showCheckout;
    },
    // go back to main page
    goBack: function () {
      this.showCheckout = true;
    },

    // saves order info
    saveOrderInfo: function () {
      const lessonIds = this.cart.map((lesson) => lesson._id);
      const subject = this.cart.map((lesson) => lesson.subject);
      const spaces = [];

      // Count number of times each lesson appears in cart
      lessonIds.forEach((id, i) => {
        if (lessonIds.indexOf(id) === i) {
          let count = 0;
          lessonIds.forEach((countId) => {
            if (countId === id) count++;
          });
          spaces.push(count);
        }
      });
      // POST order to backend
      fetch("https://cst3145-cw1-backend.onrender.com/Afterschool/orderInfo", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: this.orderInformation.nameInput,
          phoneNumber: this.orderInformation.phoneNumber,
          email: this.orderInformation.email,
          subject: subject,
          spaces: spaces,
          lessonId: lessonIds,
        }),
      })
        .then((response) => response.json())
        .then((data) => {
          console.log("Order saved:", data);
          this.showbill = true;

          // Update lesson spaces in backend after successful order
          for (let i = 0; i < this.cart.length; i++) {
            const lesson = this.cart[i];
            const booked =
              spaces[this.cart.map((l) => l._id).indexOf(lesson._id)];

            // calculates the updated spaces
            const updatedSpaces = lesson.intialSpaces - booked;
            // Update backend for each lesson
            fetch(
              `https://cst3145-cw1-backend.onrender.com/Afterschool/lesson/${lesson._id}`,
              {
                method: "PUT",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  spaces: updatedSpaces,
                }),
              }
            )
              .then((response) => response.json())
              .then((update) => {
                console.log(`Lesson ${lesson} updated to: `, updatedSpaces);
              });
          }
        })
        .catch((error) => {
          console.error("Error:", error);
        });
    },

    // Search lessons based on keyword
    search: function () {
      const keyword = this.searchInput;
      fetch(
        `https://cst3145-cw1-backend.onrender.com/Afterschool/lesson/search?q=${keyword}`
      ).then(function (response) {
        response.json().then(function (json) {
          afterSchool.lessons = json;
        });
      });
    },

    // Close bill and reload page
    closeBill: function () {
      this.showbill = false;
      window.location.reload();
    },
  },

  computed: {
    // Count items in cart
    cartCount: function () {
      return this.cart.length;
    },

    // sorting function based on key and order
    sortfunction: function () {
      let sortedList = this.lessons.slice();

      if (!this.key || !this.order) {
        return sortedList;
      }
      const order = this.order === "asc" ? 1 : -1;

      if (this.key === "subject") {
        return sortedList.sort(
          (a, b) => a.subject.localeCompare(b.subject) * order
        );
      } else if (this.key === "price") {
        return sortedList.sort((a, b) => (a.price - b.price) * order);
      } else if (this.key === "location") {
        return sortedList.sort(
          (a, b) => a.location.localeCompare(b.location) * order
        );
      } else if (this.key === "spaces") {
        return sortedList.sort((a, b) => (a.spaces - b.spaces) * order);
      } else {
        return sortedList;
      }
    },

    // Validation for checkout fields
    validatePhone: function () {
      let regex = /^\d{10}$/;
      let phoneNumber = this.orderInformation.phoneNumber.trim();
      return !!(regex.test(phoneNumber) && phoneNumber);
    },

    validateName: function () {
      let regex = /^[A-Za-z]+$/;
      let name = this.orderInformation.nameInput.trim();
      return !!(regex.test(name) && name);
    },

    validateEmail: function () {
      let regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      let email = this.orderInformation.email.trim();

      return !!(regex.test(email) && email);
    },

    // checks if all validations are successful
    isFormFilled: function () {
      return this.validateEmail && this.validateName && this.validatePhone;
    },

    // shows validation errors

    showPhoneError: function () {
      return (
        this.orderInformation.phoneNumber.length > 0 && !this.validatePhone
      );
    },

    showNameError: function () {
      return this.orderInformation.nameInput.length > 0 && !this.validateName;
    },
    showEmailError: function () {
      return this.orderInformation.email.length > 0 && !this.validateEmail;
    },
  },
});
